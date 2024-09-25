import { AnyObject, Point, hasArrayProp, hasObjectProp, hasStringProp } from '@eclipse-glsp/server';

/**
 * The source model for `dynamic` GLSP diagrams. A `DynamicModel` is a
 * plain JSON objects that contains a set of {@link Node nodes} and {@link Edge edges}.
 */
export interface DynamicModel {
  id: string;
  nodes: Node[];
  edges: Edge[];
}

export namespace DynamicModel {
  export function is(object: any): object is DynamicModel {
    return AnyObject.is(object) && hasStringProp(object, 'id') && hasArrayProp(object, 'nodes');
  }
}

export interface Node {
  type: 'node';
  id: string;
  name: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

export namespace Node {
  export function is(object: any): object is Node {
    return (
      AnyObject.is(object) &&
      hasStringProp(object, 'id') &&
      hasStringProp(object, 'name') &&
      hasObjectProp(object, 'position')
    );
  }
}

export interface Edge {
  type: 'edge';
  id: string;
  name: string;
  sourceId: string;
  targetId: string;
  routingPoints?: Point[];
}

export namespace Edge {
  export function is(object: any): object is Edge {
    return (
      AnyObject.is(object) &&
      hasStringProp(object, 'id') &&
      hasStringProp(object, 'name') &&
      hasStringProp(object, 'sourceId') &&
      hasStringProp(object, 'targetId')
    );
  }
}
