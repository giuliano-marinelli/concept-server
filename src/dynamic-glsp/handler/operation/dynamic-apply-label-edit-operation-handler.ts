import { ApplyLabelEditOperation } from '@eclipse-glsp/protocol';
import {
  Command,
  GEdge,
  GLSPServerError,
  GNode,
  JsonOperationHandler,
  MaybePromise,
  toTypeGuard
} from '@eclipse-glsp/server/node';

import { DynamicModelState } from '../../model/dynamic-model-state';
import { inject, injectable } from 'inversify';

@injectable()
export class DynamicApplyLabelEditOperationHandler extends JsonOperationHandler {
  readonly operationType = ApplyLabelEditOperation.KIND;

  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  override createCommand(operation: ApplyLabelEditOperation): MaybePromise<Command | undefined> {
    return this.commandOf(() => {
      const index = this.modelState.index;
      // retrieve the parent GNode or GEdge of the label that should be edited
      const gNode = index.findParentElement(operation.labelId, toTypeGuard(GNode));
      const gEdge = index.findParentElement(operation.labelId, toTypeGuard(GEdge));

      // retrieve the model element that corresponds to the parent GNode or GEdge
      const modelElement = gNode ? index.findNode(gNode.id) : gEdge ? index.findEdge(gEdge.id) : undefined;

      // if the model element was found, update its name with the new text, otherwise throw an error
      if (modelElement) {
        modelElement.name = operation.text;
      } else {
        throw new GLSPServerError(`Could not retrieve the parent node for the label with id ${operation.labelId}`);
      }
    });
  }
}
