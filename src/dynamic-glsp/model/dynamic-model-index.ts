import { GModelIndex } from '@eclipse-glsp/server';

import { injectable } from 'inversify';

import { DynamicModel, Edge, Node } from './dynamic-model';

@injectable()
export class DynamicModelIndex extends GModelIndex {
  protected idToDynamicModelElement = new Map<string, Node | Edge>();

  indexDynamicModel(dynamicModel: DynamicModel): void {
    this.idToDynamicModelElement.clear();
    for (const element of [...dynamicModel.nodes, ...dynamicModel.edges]) {
      this.idToDynamicModelElement.set(element.id, element);
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
    return this.idToDynamicModelElement.get(id);
  }
}
