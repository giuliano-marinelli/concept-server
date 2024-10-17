import { DefaultTypes } from '@eclipse-glsp/server';

import { ExternalServices } from '../diagram/dynamic-external-services';
import { inject, injectable } from 'inversify';

export const LanguageSpecification = Symbol('LanguageSpecification');

export interface LanguageSpecification {
  language: any;
  load(): void;
}

@injectable()
export class DynamicLanguageSpecification implements LanguageSpecification {
  language: {
    nodes: { type: string; label: string; gModel?: any }[];
    edges: { type: string; label: string; gModel?: any }[];
  };

  protected services;

  constructor(@inject(ExternalServices) services: ExternalServices) {
    this.services = services;
  }

  async load() {
    console.log('DynamicLanguageSpecification loaded');

    // console.log(this.services);
    // console.log('random user', await this.services.usersService?.findOne('6b060ffd-b6e9-47d7-8108-9c85e6335f78'));

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
