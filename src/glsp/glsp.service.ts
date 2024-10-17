import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import {
  ServerModule,
  SocketLaunchOptions,
  WebSocketServerLauncher,
  createAppModule,
  createSocketCliParser,
  defaultLaunchOptions
} from '@eclipse-glsp/server/node';

import { Container } from 'inversify';

import { UsersService } from 'src/users/users.service';

import { DynamicDiagramModule } from '../dynamic-glsp/diagram/dynamic-diagram-module';

@Injectable()
export class GLSPService implements OnModuleInit {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

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

    // define NestJS services that can be used in the GLSP diagram module
    const services = {
      usersService: this.usersService
    };

    // create a GLSP Server Module with the Diagram Module (this will use a custom server module and diagram module for dynamic diagram language support)
    const serverModule = new ServerModule().configureDiagramModule(new DynamicDiagramModule(services));

    // create a new WebSocketServerLauncher
    const launcher = container.resolve(WebSocketServerLauncher);

    // configure the server module and start the server
    await launcher.configure(serverModule);
    await launcher.start({ port: options.port, host: options.host, path: 'dynamic' });
  }
}
