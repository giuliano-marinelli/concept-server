import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  GLSPServerError,
  SocketLaunchOptions,
  createAppModule,
  createSocketCliParser,
  defaultLaunchOptions
} from '@eclipse-glsp/server/node';

import { Container } from 'inversify';
import {
  DynamicWebSocketServerLauncher,
  MessageConnectionAuth
} from 'src/dynamic-glsp/server/dynamic-websocket-server-launcher';
import * as uuid from 'uuid';

import { AuthService } from 'src/auth/auth.service';
import { MetamodelsService } from 'src/metamodels/metamodels.service';

import { DynamicDiagramModule } from '../dynamic-glsp/diagram/dynamic-diagram-module';
import { DynamicServerModule } from 'src/dynamic-glsp/server/dynamic-server-module';

@Injectable()
export class GLSPService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly metamodelsService: MetamodelsService
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
        return await this.metamodelsService?.findOne(
          'f87f6b58-3256-4630-a629-8ad3c976a4f3',
          { metanodes: true },
          authUser
        );
      },
      modelProvider: async (modelID: string, connectionAuth: MessageConnectionAuth) => {
        return { id: uuid.v4(), nodes: [], edges: [] };
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
}
