import { AbstractJsonModelStorage, GLSPServerError, Point, RequestModelAction } from '@eclipse-glsp/server/node';

import { ExternalServices } from '../diagram/dynamic-external-services';
import { SaveModelAction } from '../protocol/action/model-save';
import { Language } from '../protocol/language';
import { AuthClientAction } from '../server/dynamic-auth-client-action';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';

import { DynamicLanguageSpecification } from './dynamic-language-specification';
import { DynamicModel } from './dynamic-model';
import { DynamicModelState } from './dynamic-model-state';

@injectable()
export class DynamicStorage extends AbstractJsonModelStorage {
  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  @inject(DynamicLanguageSpecification)
  protected languageSpecification: DynamicLanguageSpecification;

  @inject(ExternalServices)
  protected services: ExternalServices;

  async loadSourceModel(action: RequestModelAction & AuthClientAction): Promise<void> {
    const { connectionAuth } = action;
    const sourceUri = this.getSourceUri(action);

    if (!this.services.modelProvider) {
      throw new GLSPServerError('No model provider was defined');
    }

    const language = this.languageSpecification.language;

    // if language specification has a "showcase" create a model for showcase
    // else language is not for showcase, use the model provider to get the model
    const model =
      language.id == 'showcase'
        ? this.createModelForShowcase(language)
        : await this.services.modelProvider(sourceUri, connectionAuth);

    // update the source model with the new model
    if (language.id != 'showcase' || !this.modelState.sourceModel) this.modelState.updateSourceModel(model);
  }

  async saveSourceModel(action: SaveModelAction & AuthClientAction): Promise<void> {
    const { connectionAuth, preview } = action;
    const sourceUri = this.getFileUri(action);
    const model = this.modelState.sourceModel;

    if (!this.services.modelSaver) {
      throw new GLSPServerError('No model saver was defined');
    }

    // use the model saver to save the model
    await this.services.modelSaver(sourceUri, model, preview, connectionAuth);
  }

  protected override createModelForEmptyFile(): DynamicModel {
    return {
      id: uuid.v4(),
      nodes: [],
      edges: []
    };
  }

  protected createModelForShowcase(language: Language): DynamicModel {
    const model = { id: 'showcase', nodes: [], edges: [] };

    const showcaseNode = Object.values(language.nodes)[0];
    const showcaseEdge = Object.values(language.edges)[0];

    // if showcase language has a node, add it to the model
    if (showcaseNode) {
      const node = {
        id: 'showcase_element',
        type: showcaseNode.name,
        position: Point.ORIGIN,
        size: { width: 50, height: 25 }
      };
      model.nodes.push(node);
    }
    //   else if (languageElement.type == LanguageElementType.EDGE) {
    //     const edge = {
    //       id: 'showcase',
    //       type: languageElement.name,
    //       source: 'source',
    //       target: 'target',
    //       model: undefined
    //     };
    //     this.modelState.sourceModel.nodes = [];
    //     this.modelState.sourceModel.edges = [edge];
    //   }

    return model;
  }
}
