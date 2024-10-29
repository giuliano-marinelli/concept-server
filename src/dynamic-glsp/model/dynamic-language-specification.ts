import { DefaultTypes, GLSPServerError } from '@eclipse-glsp/server';

import { ExternalServices } from '../diagram/dynamic-external-services';
import { LoadLanguageSpecificationAction } from '../handler/action/dynamic-load-language-specification-action-handler';
import { AuthClientAction } from '../server/dynamic-auth-client-action';
import { MessageConnectionAuth } from '../server/dynamic-websocket-server-launcher';
import { inject, injectable } from 'inversify';

export const LanguageSpecification = Symbol('LanguageSpecification');

export interface LanguageSpecification {
  language: any;
  load(action: LoadLanguageSpecificationAction & AuthClientAction): void;
}

@injectable()
export class DynamicLanguageSpecification implements LanguageSpecification {
  language: {
    nodes: { type: string; label: string; gModel?: any }[];
    edges: { type: string; label: string; gModel?: any }[];
  };

  @inject(ExternalServices)
  protected services: ExternalServices;

  async load(action: LoadLanguageSpecificationAction & AuthClientAction) {
    const { languageID, connectionAuth } = action;

    if (!this.services.languageProvider) {
      throw new GLSPServerError('No language provider was defined');
    }

    // use the language provider to get the language specification
    const language = await this.services.languageProvider(languageID, connectionAuth);

    console.log(language);

    this.language = {
      nodes: [
        { type: 'entity', label: 'Entity', gModel: { type: DefaultTypes.NODE, layout: 'vbox' } },
        { type: 'relationship', label: 'Relationship', gModel: { type: DefaultTypes.NODE_DIAMOND, layout: 'hbox' } },
        { type: 'other', label: 'Other' }
      ],
      edges: [{ type: 'connector', label: 'Connector' }]
    };
  }
}
