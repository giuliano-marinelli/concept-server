import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  GLSPServerError,
  SocketLaunchOptions,
  createAppModule,
  createSocketCliParser,
  defaultLaunchOptions
} from '@eclipse-glsp/server/node';

import { Container } from 'inversify';
import { Language } from 'src/dynamic-glsp/protocol/language';
import {
  DynamicWebSocketServerLauncher,
  MessageConnectionAuth
} from 'src/dynamic-glsp/server/dynamic-websocket-server-launcher';
import * as uuid from 'uuid';

import { MetaModel } from 'src/meta-models/entities/meta-model.entity';

import { AuthService } from 'src/auth/auth.service';
import { MetaModelsService } from 'src/meta-models/meta-models.service';

import { DynamicDiagramModule } from '../dynamic-glsp/diagram/dynamic-diagram-module';
import { DynamicServerModule } from 'src/dynamic-glsp/server/dynamic-server-module';

@Injectable()
export class GLSPService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly metamodelsService: MetaModelsService
  ) {}

  onModuleInit() {
    this.launch().catch((error) => console.error('Error in dynamic GLSP server:', error));
  }

  async launch() {
    // define container options
    const options = createSocketCliParser<SocketLaunchOptions>({
      ...defaultLaunchOptions,
      port: 3001,
      host: '127.0.0.1'
    }).parse();

    // create a new inversify container
    const container = new Container();

    // load a new GLSP app module
    container.load(createAppModule(options));

    // define services that GLSP needs to access the metamodels and models information
    const services = {
      languageProvider: async (languageID: string, connectionAuth: MessageConnectionAuth) => {
        const authUser = await this.authService.checkUser(
          connectionAuth.auth,
          connectionAuth.userAgent,
          connectionAuth.ip,
          (message) => new GLSPServerError(message)
        );

        const metaModel: MetaModel = await this.metamodelsService?.findOne(
          languageID,
          { metaElements: true },
          authUser
        );

        if (!metaModel) {
          throw new GLSPServerError(`MetaModel with id ${languageID} not found`);
        }

        return this.parseMetaModel(metaModel);
      },
      modelProvider: async (modelID: string, connectionAuth: MessageConnectionAuth) => {
        return { id: uuid.v4(), nodes: [], edges: [] };
      },
      modelSaver: async (modelID: string, model: any, preview: any, connectionAuth: MessageConnectionAuth) => {
        console.log('model saved:', preview);

        return;
      }
    };

    // create a GLSP Server Module with the Diagram Module (this will use a custom server module and diagram module for dynamic diagram language support)
    const serverModule = new DynamicServerModule().configureDiagramModule(new DynamicDiagramModule(services));

    // create a new WebSocketServerLauncher
    const launcher = container.resolve(DynamicWebSocketServerLauncher);

    // configure the server module and start the server
    await launcher.configure(serverModule);
    await launcher.start({ port: options.port, host: options.host, path: 'dynamic' });
  }

  parseMetaModel(metaModel: MetaModel) {
    return {
      id: metaModel.id,
      name: metaModel.tag,
      version: metaModel.version,
      title: metaModel.name,
      nodes: metaModel.metaElements
        .filter((metaElement) => metaElement.type === 'node')
        .reduce((acc, metaElement) => {
          acc[metaElement.tag] = {
            type: 'node',
            name: metaElement.tag,
            label: metaElement.name,
            gModel: metaElement.gModel,
            aModel: metaElement.aModel,
            default: metaElement.defaultModel
          };
          return acc;
        }, {}),
      edges: metaModel.metaElements
        .filter((metaElement) => metaElement.type === 'edge')
        .reduce((acc, metaElement) => {
          acc[metaElement.tag] = {
            type: 'edge',
            name: metaElement.tag,
            label: metaElement.name,
            gModel: metaElement.gModel,
            aModel: metaElement.aModel,
            default: metaElement.defaultModel
          };
          return acc;
        }, {})
    } as Language;
  }
}
