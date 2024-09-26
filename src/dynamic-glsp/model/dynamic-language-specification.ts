import { DefaultTypes } from '@eclipse-glsp/server';

import { injectable } from 'inversify';

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

  constructor() {
    this.load();
  }

  async load() {
    this.language = {
      nodes: [
        { type: 'entity', label: 'Entity', gModel: { type: DefaultTypes.NODE, layout: 'vbox' } },
        { type: 'relationship', label: 'Relationship', gModel: { type: DefaultTypes.NODE_DIAMOND, layout: 'hbox' } }
      ],
      edges: [{ type: 'connector', label: 'Connector' }]
    };
  }
}
