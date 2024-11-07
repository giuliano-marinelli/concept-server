import { GEdgeSchema, GModelElementSchema, GNodeSchema } from '@eclipse-glsp/protocol';

import { AModelElementSchema, AModelRootSchema } from './amodel';

export enum LanguageElementType {
  NODE = 'node',
  EDGE = 'edge'
}

export interface LanguageElement {
  type: LanguageElementType;
  name: string;
  label: string;
  gModel: GModelElementSchema;
  aModel: AModelElementSchema;
  default: any;
}

export interface LanguageNode extends LanguageElement {
  type: LanguageElementType.NODE;
  gModel: GNodeSchema;
  aModel: AModelRootSchema;
}

export interface LanguageEdge extends LanguageElement {
  type: LanguageElementType.EDGE;
  gModel: GEdgeSchema;
  aModel: AModelRootSchema;
}

export interface Language {
  id: string;
  name: string;
  version: string;
  title: string;
  nodes: {
    [nodeName: string]: LanguageNode;
  };
  edges: {
    [edgeName: string]: LanguageEdge;
  };
}
