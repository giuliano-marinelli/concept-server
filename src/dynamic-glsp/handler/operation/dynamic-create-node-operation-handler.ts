import {
  Args,
  Command,
  CreateNodeOperation,
  DefaultTypes,
  GModelSerializer,
  GhostElement,
  JsonCreateNodeOperationHandler,
  MaybePromise,
  Point,
  TriggerNodeCreationAction
} from '@eclipse-glsp/server';

import { DynamicGModelFactory } from '../../model/dynamic-gmodel-factory';
import { Node } from '../../model/dynamic-model';
import { DynamicModelState } from '../../model/dynamic-model-state';
import { inject, injectable } from 'inversify';
import { DynamicLanguageSpecification } from 'src/dynamic-glsp/model/dynamic-language-specification';
import * as uuid from 'uuid';

@injectable()
export class DynamicCreateNodeOperationHandler extends JsonCreateNodeOperationHandler {
  elementTypeIds = [DefaultTypes.NODE];

  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  @inject(GModelSerializer)
  protected serializer: GModelSerializer;

  @inject(DynamicGModelFactory)
  protected modelFactory: DynamicGModelFactory;

  @inject(DynamicLanguageSpecification)
  protected languageSpecification: DynamicLanguageSpecification;

  override createCommand(operation: CreateNodeOperation): MaybePromise<Command | undefined> {
    return this.commandOf(() => {
      const relativeLocation = this.getRelativeLocation(operation) ?? Point.ORIGIN;
      const node = this.createNode((operation.args?.type as string) ?? DefaultTypes.NODE, relativeLocation);
      const dynamicModel = this.modelState.sourceModel;
      dynamicModel.nodes.push(node);
    });
  }

  protected createNode(nodeType: string, position?: Point): Node {
    // const nodeCounter = this.modelState.index.getAllByClass(GNode).length;
    const nodeSpec = nodeType
      ? this.languageSpecification.language.nodes.find((node) => node.type === nodeType)
      : undefined;
    return {
      id: uuid.v4(),
      type: nodeType,
      name: nodeSpec?.label ?? 'Node',
      position: position ?? Point.ORIGIN
    };
  }

  override getTriggerActions(): TriggerNodeCreationAction[] {
    this.elementTypeIds = this.languageSpecification.language.nodes.map((node) => node.type);
    return this.elementTypeIds.map((elementTypeId) => this.createTriggerNodeCreationAction(elementTypeId));
  }

  protected override createTriggerNodeCreationAction(elementTypeId: string): TriggerNodeCreationAction {
    return TriggerNodeCreationAction.create(DefaultTypes.NODE, {
      ghostElement: this.createTriggerGhostElement(elementTypeId),
      args: this.createTriggerArgs(elementTypeId)
    });
  }

  protected override createTriggerArgs(elementTypeId: string): Args | undefined {
    return this.languageSpecification?.language?.nodes?.find((node) => node.type === elementTypeId) ?? undefined;
  }

  protected override createTriggerGhostElement(elementTypeId: string): GhostElement | undefined {
    return {
      template: this.serializer.createSchema(this.modelFactory.createNode(this.createNode(elementTypeId))),
      dynamic: true
    };
  }

  get label(): string {
    return 'Node';
  }
}
