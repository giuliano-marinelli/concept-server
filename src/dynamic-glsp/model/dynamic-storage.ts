import { AbstractJsonModelStorage, MaybePromise, RequestModelAction, SaveModelAction } from '@eclipse-glsp/server/node';

import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';

import { DynamicLanguageSpecification } from './dynamic-language-specification';
import { DynamicModel } from './dynamic-model';
import { DynamicModelState } from './dynamic-model-state';

@injectable()
export class DynamicStorage extends AbstractJsonModelStorage {
  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  loadSourceModel(action: RequestModelAction): MaybePromise<void> {
    console.log('loadSourceModel');
    // const sourceUri = this.getSourceUri(action);
    // const dynamicModel = this.loadFromFile(sourceUri, DynamicModel.is);
    // this.modelState.updateSourceModel(dynamicModel);
    const emptyModel = this.createModelForEmptyFile();
    this.modelState.updateSourceModel(emptyModel);
  }

  saveSourceModel(action: SaveModelAction): MaybePromise<void> {
    console.log('saveSourceModel');
    // const sourceUri = this.getFileUri(action);
    // this.writeFile(sourceUri, this.modelState.sourceModel);
  }

  protected override createModelForEmptyFile(): DynamicModel {
    const personId = uuid.v4();
    const studentId = uuid.v4();

    return {
      id: uuid.v4(),
      nodes: [
        {
          type: 'entity',
          id: personId,
          name: 'Person',
          position: { x: 100, y: 100 }
        },
        {
          type: 'relationship',
          id: studentId,
          name: 'Student',
          position: { x: 200, y: 100 }
        }
      ],
      edges: [
        {
          type: 'connector',
          id: uuid.v4(),
          name: 'is a',
          sourceId: personId,
          targetId: studentId
        }
      ]
    };
  }
}
