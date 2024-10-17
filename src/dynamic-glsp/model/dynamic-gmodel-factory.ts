import { ArgsUtil, DefaultTypes, GEdge, GGraph, GLabel, GModelFactory, GNode } from '@eclipse-glsp/server';

import { inject, injectable } from 'inversify';

import { DynamicLanguageSpecification } from './dynamic-language-specification';
import { Edge, Node } from './dynamic-model';
import { DynamicModelState } from './dynamic-model-state';

@injectable()
export class DynamicGModelFactory implements GModelFactory {
  @inject(DynamicModelState)
  protected modelState: DynamicModelState;

  @inject(DynamicLanguageSpecification)
  protected languageSpecification: DynamicLanguageSpecification;

  createModel(): void {
    const dynamicModel = this.modelState.sourceModel;
    this.modelState.index.indexModel(dynamicModel);

    const childNodes = dynamicModel.nodes.map((node) => this.createNode(node));
    const childEdges = dynamicModel.edges.map((edge) => this.createEdge(edge));

    const newRoot = GGraph.builder().id(dynamicModel.id).addChildren(childNodes).addChildren(childEdges).build();

    this.modelState.updateRoot(newRoot);
  }

  createNode(node: Node): GNode {
    const nodeSpec = node.type
      ? this.languageSpecification?.language?.nodes?.find((langNode) => langNode.type === node.type)
      : undefined;
    const builder = GNode.builder() //
      .type(nodeSpec?.gModel?.type ?? DefaultTypes.NODE)
      .id(node.id)
      .addCssClass('node')
      .addArgs(ArgsUtil.cornerRadius(5))
      .layout(nodeSpec?.gModel?.layout ?? 'hbox')
      .add(
        GLabel.builder() //
          .text(node.name)
          .id(`${node.id}_label`)
          .build()
      )
      .size(node.size?.width ?? 50, node.size?.height ?? 25)
      .position(node.position);

    if (node.size) {
      builder.addLayoutOptions({ prefWidth: node.size.width, prefHeight: node.size.height });
    }

    return builder.build();
  }

  createEdge(edge: Edge): GEdge {
    const edgeSpec = edge.type
      ? this.languageSpecification?.language?.edges?.find((langEdge) => langEdge.type === edge.type)
      : undefined;
    return GEdge.builder() //
      .id(edge.id)
      .addCssClass('edge')
      .sourceId(edge.sourceId)
      .targetId(edge.targetId)
      .addRoutingPoints(edge.routingPoints ?? [])
      .add(
        GLabel.builder() //
          .text(edge.name)
          .id(`${edge.id}_label`)
          .edgePlacement({ side: 'bottom', position: 0.5, rotate: true, offset: 5 })
          .build()
      )
      .build();
  }
}
