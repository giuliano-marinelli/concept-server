import { Action, ActionHandler, Args, RequestAction, ResponseAction, hasObjectProp } from '@eclipse-glsp/server';

import { inject, injectable } from 'inversify';
import { DynamicLanguageSpecification } from 'src/dynamic-glsp/model/dynamic-language-specification';
import { AuthClientAction } from 'src/dynamic-glsp/server/dynamic-auth-client-action';

/*
 This RequestAction and ResponseActions interfaces must be in a shared project to be used in both the client and server.
 This are shared by: DynamicStartup and DynamicLoadLanguageSpecificationActionHandler
*/

export interface LoadLanguageSpecificationAction extends RequestAction<ReadyLanguageSpecificationAction> {
  kind: typeof LoadLanguageSpecificationAction.KIND;

  languageID: string;
}

export namespace LoadLanguageSpecificationAction {
  export const KIND = 'loadLanguageSpecification';

  export function is(object: unknown): object is LoadLanguageSpecificationAction {
    return RequestAction.hasKind(object, KIND) && hasObjectProp(object, 'languageID');
  }

  export function create(languageID: string, options: { args?: Args } = {}): LoadLanguageSpecificationAction {
    return {
      kind: KIND,
      requestId: '',
      languageID,
      ...options
    };
  }
}

export interface ReadyLanguageSpecificationAction extends ResponseAction {
  kind: typeof ReadyLanguageSpecificationAction.KIND;
}

export namespace ReadyLanguageSpecificationAction {
  export const KIND = 'readyLanguageSpecification';

  export function is(object: unknown): object is ReadyLanguageSpecificationAction {
    return Action.hasKind(object, KIND);
  }

  export function create(options: { responseId?: string } = {}): ReadyLanguageSpecificationAction {
    return {
      kind: KIND,
      responseId: '',
      ...options
    };
  }
}

@injectable()
export class DynamicLoadLanguageSpecificationActionHandler implements ActionHandler {
  readonly actionKinds = [LoadLanguageSpecificationAction.KIND];

  @inject(DynamicLanguageSpecification)
  protected languageSpecification: DynamicLanguageSpecification;

  async execute(action: LoadLanguageSpecificationAction): Promise<Action[]> {
    await this.languageSpecification.load(action as LoadLanguageSpecificationAction & AuthClientAction);

    return [ReadyLanguageSpecificationAction.create()];
  }
}
