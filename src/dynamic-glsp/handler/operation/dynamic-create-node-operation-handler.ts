import {
  Command,
  CreateNodeOperation,
  DefaultTypes,
  GModelSerializer,
  GhostElement,
  JsonCreateNodeOperationHandler,
  MaybePromise,
  Point
} from '@eclipse-glsp/server';

import { DynamicGModelFactory } from '../../model/dynamic-gmodel-factory';
import { Node } from '../../model/dynamic-model';
import { DynamicModelState } from '../../model/dynamic-model-state';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';

@injectable()
export class DynamicCreateNodeOperationHandler extends JsonCreateNodeOperationHandler {
  elementTypeIds = [DefaultTypes.NODE];
  //   nodeName: string = 'Node';

  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  @inject(GModelSerializer)
  protected serializer: GModelSerializer;

  @inject(DynamicGModelFactory)
  protected modelFactory: DynamicGModelFactory;

  //   constructor(nodeName: string) {
  //     super();
  //     this.nodeName = nodeName;
  //   }

  override createCommand(operation: CreateNodeOperation): MaybePromise<Command | undefined> {
    return this.commandOf(() => {
      const relativeLocation = this.getRelativeLocation(operation) ?? Point.ORIGIN;
      const node = this.createNode(relativeLocation);
      const dynamicModel = this.modelState.sourceModel;
      dynamicModel.nodes.push(node);
    });
  }

  protected createNode(position?: Point): Node {
    // const nodeCounter = this.modelState.index.getAllByClass(GNode).length;
    return {
      type: 'node',
      id: uuid.v4(),
      name: 'Node',
      position: position ?? Point.ORIGIN
    };
  }

  protected override createTriggerGhostElement(elementTypeId: string): GhostElement | undefined {
    return { template: this.serializer.createSchema(this.modelFactory.createNode(this.createNode())), dynamic: true };
  }

  get label(): string {
    return 'Node';
  }
}
