import { GModelIndex } from '@eclipse-glsp/server';

import { injectable } from 'inversify';

import { DynamicModel, Edge, Node } from './dynamic-model';

@injectable()
export class DynamicModelIndex extends GModelIndex {
  protected idToModelElement = new Map<string, Node | Edge>();

  indexModel(model: DynamicModel): void {
    this.idToModelElement.clear();
    for (const element of [...model.nodes, ...model.edges]) {
      this.idToModelElement.set(element.id, element);
    }
  }

  findNode(id: string): Node | undefined {
    const element = this.findNodeOrEdge(id);
    return Node.is(element) ? element : undefined;
  }

  findEdge(id: string): Edge | undefined {
    const element = this.findNodeOrEdge(id);
    return Edge.is(element) ? element : undefined;
  }

  findNodeOrEdge(id: string): Node | Edge | undefined {
    return this.idToModelElement.get(id);
  }
}
