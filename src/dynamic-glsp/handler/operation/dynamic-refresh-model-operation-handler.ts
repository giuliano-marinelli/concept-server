import { Command, JsonOperationHandler, MaybePromise } from '@eclipse-glsp/server/node';

import { injectable } from 'inversify';
import { RefreshModelOperation } from 'src/dynamic-glsp/protocol/operation/refresh-model';

@injectable()
export class DynamicRefreshModelOperationHandler extends JsonOperationHandler {
  readonly operationType = RefreshModelOperation.KIND;

  override createCommand(): MaybePromise<Command | undefined> {
    return this.commandOf(() => {
      // nothing
    });
  }
}
