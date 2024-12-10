import { GLSPServerError } from '@eclipse-glsp/server';

import { ExternalServices } from '../diagram/dynamic-external-services';
import { LoadLanguageSpecificationAction } from '../protocol/action/language-specification-load';
import { Language } from '../protocol/language';
import { AuthClientAction } from '../server/dynamic-auth-client-action';
import { inject, injectable } from 'inversify';

export const LanguageSpecification = Symbol('LanguageSpecification');

export interface LanguageSpecification {
  language: Language;
  load(action: LoadLanguageSpecificationAction & AuthClientAction): void;
}

@injectable()
export class DynamicLanguageSpecification implements LanguageSpecification {
  language: Language;

  @inject(ExternalServices)
  protected services: ExternalServices;

  async load(action: LoadLanguageSpecificationAction & AuthClientAction) {
    const { languageID, connectionAuth } = action;

    if (!this.services.languageProvider) {
      throw new GLSPServerError('No language provider was defined');
    }

    // use the language provider to get the language specification
    const language = await this.services.languageProvider(languageID, connectionAuth);

    console.log('Language Specification', language);

    this.language = language;
  }
}
