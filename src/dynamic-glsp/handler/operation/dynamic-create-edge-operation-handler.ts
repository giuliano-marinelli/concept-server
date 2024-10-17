import {
  Args,
  Command,
  CreateEdgeOperation,
  DefaultTypes,
  JsonCreateEdgeOperationHandler,
  MaybePromise,
  TriggerEdgeCreationAction
} from '@eclipse-glsp/server';

import { Edge } from '../../model/dynamic-model';
import { DynamicModelState } from '../../model/dynamic-model-state';
import { inject, injectable } from 'inversify';
import { DynamicLanguageSpecification } from 'src/dynamic-glsp/model/dynamic-language-specification';
import * as uuid from 'uuid';

@injectable()
export class DynamicCreateEdgeOperationHandler extends JsonCreateEdgeOperationHandler {
  elementTypeIds = [DefaultTypes.EDGE];

  @inject(DynamicModelState)
  protected override modelState: DynamicModelState;

  @inject(DynamicLanguageSpecification)
  protected languageSpecification: DynamicLanguageSpecification;

  override createCommand(operation: CreateEdgeOperation): MaybePromise<Command | undefined> {
    return this.commandOf(() => {
      const edgeType = operation.args?.type as string;
      const edgeSpec = edgeType
        ? this.languageSpecification.language?.edges?.find((edge) => edge.type === edgeType)
        : undefined;
      const edge: Edge = {
        id: uuid.v4(),
        type: edgeType,
        name: edgeSpec?.label ?? 'edge',
        sourceId: operation.sourceElementId,
        targetId: operation.targetElementId
      };
      this.modelState.sourceModel.edges.push(edge);
    });
  }

  override getTriggerActions(): TriggerEdgeCreationAction[] {
    this.elementTypeIds = this.languageSpecification.language?.edges?.map((edge) => edge.type) ?? this.elementTypeIds;
    return this.elementTypeIds.map((elementTypeId) =>
      TriggerEdgeCreationAction.create(DefaultTypes.EDGE, { args: this.createTriggerArgs(elementTypeId) })
    );
  }

  protected createTriggerArgs(elementTypeId: string): Args | undefined {
    return this.languageSpecification?.language?.edges?.find((node) => node.type === elementTypeId) ?? undefined;
  }

  get label(): string {
    return 'Edge';
  }
}
