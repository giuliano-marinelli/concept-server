import { Command, JsonOperationHandler, MaybePromise } from '@eclipse-glsp/server/node';

import { inject, injectable } from 'inversify';
import { LanguageSpecification } from 'src/dynamic-glsp/model/dynamic-language-specification';
import { DynamicModelState } from 'src/dynamic-glsp/model/dynamic-model-state';
import { RefreshModelOperation } from 'src/dynamic-glsp/protocol/operation/refresh-model';

@injectable()
export class DynamicRefreshModelOperationHandler extends JsonOperationHandler {
  readonly operationType = RefreshModelOperation.KIND;

  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  @inject(LanguageSpecification)
  protected languageSpecification: LanguageSpecification;

  override createCommand(): MaybePromise<Command | undefined> {
    return this.commandOf(() => {
      // if in showcase mode, we need to update the model of showcase element with the new default model
      const element = this.modelState.index.findNodeOrEdge('showcase_element');

      // find element specification on language
      const elementSpecification =
        this.languageSpecification.language.nodes[element.type] ||
        this.languageSpecification.language.edges[element.type];

      // update the element's model
      element.model = elementSpecification.default;
    });
  }
}
