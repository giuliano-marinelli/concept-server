import { DefaultModelState, JsonModelState } from '@eclipse-glsp/server';

import { inject, injectable } from 'inversify';

import { DynamicModel } from './dynamic-model';
import { DynamicModelIndex } from './dynamic-model-index';

@injectable()
export class DynamicModelState extends DefaultModelState implements JsonModelState<DynamicModel> {
  @inject(DynamicModelIndex)
  override readonly index: DynamicModelIndex;

  protected _dynamicModel: DynamicModel;

  get sourceModel(): DynamicModel {
    return this._dynamicModel;
  }

  updateSourceModel(dynamicModel: DynamicModel): void {
    this._dynamicModel = dynamicModel;
    this.index.indexDynamicModel(dynamicModel);
  }
}
