import {
  AbstractJsonModelStorage,
  GLSPServerError,
  MaybePromise,
  RequestModelAction,
  SaveModelAction
} from '@eclipse-glsp/server/node';

import { ExternalServices } from '../diagram/dynamic-external-services';
import { AuthClientAction } from '../server/dynamic-auth-client-action';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';

import { DynamicModel } from './dynamic-model';
import { DynamicModelState } from './dynamic-model-state';

@injectable()
export class DynamicStorage extends AbstractJsonModelStorage {
  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  @inject(ExternalServices)
  protected services: ExternalServices;

  async loadSourceModel(action: RequestModelAction & AuthClientAction): Promise<void> {
    const { connectionAuth } = action;
    const sourceUri = this.getSourceUri(action);

    if (!this.services.modelProvider) {
      throw new GLSPServerError('No model provider was defined');
    }

    // use the model provider to get the model
    const model = await this.services.modelProvider(sourceUri, connectionAuth);

    // update the source model with the new model
    this.modelState.updateSourceModel(model);
  }

  async saveSourceModel(action: SaveModelAction & AuthClientAction): Promise<void> {
    const { connectionAuth } = action;
    const sourceUri = this.getFileUri(action);

    if (!this.services.modelSaver) {
      throw new GLSPServerError('No model saver was defined');
    }

    // use the model saver to save the model
    await this.services.modelSaver(sourceUri, this.modelState.sourceModel, connectionAuth);
  }

  protected override createModelForEmptyFile(): DynamicModel {
    return {
      id: uuid.v4(),
      nodes: [],
      edges: []
    };
  }
}
