import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { GraphQLError, GraphQLErrorOptions } from 'graphql';
import * as _ from 'lodash';

import { IS_PUBLIC_KEY } from './decorators/public.decorator';

import { AuthService } from './auth.service';
import { SharedService } from 'src/shared/shared.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly sharedService: SharedService,
    private readonly authService: AuthService
  ) {}

  private errorMessage: string = 'Failed authentication: ';
  private errorOptions: GraphQLErrorOptions = { extensions: { code: 'UNAUTHORIZED' } };

  async canActivate(execContext: ExecutionContext): Promise<boolean> {
    const context = GqlExecutionContext.create(execContext);

    const info = context.getInfo();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // in case that the controller route is not public we check the jwt token
    // get the token from the request header authorization
    const request = context.getContext().req;
    const token = this.sharedService.extractTokenFromHeader(request);

    // if the controller route is marked as public and there's no provided token, we allow access but without user information
    // this allow us to change the behavior of the route if the user is authenticated or not in the casl policies
    if (!token && isPublic) {
      console.info('\x1b[42m ' + info.fieldName + ' \x1b[0m', '\x1b[36mPUBLIC\x1b[0m');
      return true;
    }

    if (!token) throw new GraphQLError(this.errorMessage + 'authorization not found', this.errorOptions);

    // check the user
    const user = await this.authService.checkUser(
      token,
      request.headers['user-agent'],
      request.ip,
      (message) => new GraphQLError(message, this.errorOptions)
    );

    // we're assigning the user to the request object here
    // so that we can access it in our route handlers
    request['user'] = user;

    // prettier-ignore
    console.info('\x1b[42m ' + info.fieldName + ' \x1b[0m', '\x1b[35m' + user?.username, '(', user?.role, ')', '[', user?.id, ']\x1b[0m');

    return true;
  }
}
