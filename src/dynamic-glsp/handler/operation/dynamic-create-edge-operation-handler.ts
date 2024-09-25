import {
  Command,
  CreateEdgeOperation,
  DefaultTypes,
  GModelSerializer,
  JsonCreateEdgeOperationHandler,
  MaybePromise
} from '@eclipse-glsp/server';

import { DynamicGModelFactory } from '../../model/dynamic-gmodel-factory';
import { Edge } from '../../model/dynamic-model';
import { DynamicModelState } from '../../model/dynamic-model-state';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';

@injectable()
export class DynamicCreateEdgeOperationHandler extends JsonCreateEdgeOperationHandler {
  readonly elementTypeIds = [DefaultTypes.EDGE];

  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  override createCommand(operation: CreateEdgeOperation): MaybePromise<Command | undefined> {
    return this.commandOf(() => {
      const edge: Edge = {
        type: 'edge',
        id: uuid.v4(),
        name: 'edge',
        sourceId: operation.sourceElementId,
        targetId: operation.targetElementId
      };
      this.modelState.sourceModel.edges.push(edge);
    });
  }

  get label(): string {
    return 'Edge';
  }
}
