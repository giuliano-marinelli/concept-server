import { Action, ActionHandler } from '@eclipse-glsp/server';

import { inject, injectable } from 'inversify';
import { DynamicLanguageSpecification } from 'src/dynamic-glsp/model/dynamic-language-specification';
import {
  LoadLanguageSpecificationAction,
  ReadyLanguageSpecificationAction
} from 'src/dynamic-glsp/protocol/action/language-specification-load';
import { AuthClientAction } from 'src/dynamic-glsp/server/dynamic-auth-client-action';

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
