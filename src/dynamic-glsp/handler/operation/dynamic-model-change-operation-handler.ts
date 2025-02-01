import { Command, JsonOperationHandler, MaybePromise } from '@eclipse-glsp/server/node';

import { DynamicModelState } from '../../model/dynamic-model-state';
import { inject, injectable } from 'inversify';
import { ModelChangeOperation } from 'src/dynamic-glsp/protocol/operation/model-change';

@injectable()
export class DynamicModelChangeOperationHandler extends JsonOperationHandler {
  readonly operationType = ModelChangeOperation.KIND;

  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  override createCommand(operation: ModelChangeOperation): MaybePromise<Command | undefined> {
    return this.commandOf(() => {
      // retrieve the model element using the operation's elementId
      const element = this.modelState.index.findNodeOrEdge(operation.elementId);

      // HERE WE MUST VALIDATE MODEL CHANGES

      // update the element's model
      element.model = operation.newModel;
    });
  }
}
