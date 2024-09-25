import {
  ActionHandlerConstructor,
  BindingTarget,
  CommandPaletteActionProvider,
  ComputedBoundsActionHandler,
  DiagramConfiguration,
  DiagramModule,
  GModelFactory,
  GModelIndex,
  InstanceMultiBinding,
  LabelEditValidator,
  ModelState,
  OperationHandlerConstructor,
  SourceModelStorage
} from '@eclipse-glsp/server';

import { DynamicRequestClipboardDataActionHandler } from '../handler/action/dynamic-request-clipboard-data-action-handler';
import { DynamicApplyLabelEditOperationHandler } from '../handler/operation/dynamic-apply-label-edit-operation-handler';
import { DynamicChangeBoundsOperationHandler } from '../handler/operation/dynamic-change-bounds-operation-handler';
import { DynamicChangeRoutingPointsOperationHandler } from '../handler/operation/dynamic-change-routing-points-operation-handler';
import { DynamicCreateEdgeOperationHandler } from '../handler/operation/dynamic-create-edge-operation-handler';
import { DynamicCreateNodeOperationHandler } from '../handler/operation/dynamic-create-node-operation-handler';
import { DynamicCutOperationHandler } from '../handler/operation/dynamic-cut-operation-handler';
import { DynamicDeleteElementOperationHandler } from '../handler/operation/dynamic-delete-element-operation-handler';
import { DynamicPasteOperationHandler } from '../handler/operation/dynamic-paste-operation-handler';
import { DynamicReconnectEdgeOperationHandler } from '../handler/operation/dynamic-reconnect-edge-operation-handler';
import { DynamicLabelEditValidator } from '../handler/validator/dynamic-label-edit-validator';
import { DynamicGModelFactory } from '../model/dynamic-gmodel-factory';
import { DynamicModelIndex } from '../model/dynamic-model-index';
import { DynamicModelState } from '../model/dynamic-model-state';
import { DynamicStorage } from '../model/dynamic-storage';
import { injectable } from 'inversify';

import { DynamicDiagramConfiguration } from './dynamic-diagram-configuration';

@injectable()
export class DynamicDiagramModule extends DiagramModule {
  readonly diagramType = 'dynamic';

  /**
   * Bind the diagram configuration which is used to define the diagram elements behaviour and restrictions.
   */
  protected bindDiagramConfiguration(): BindingTarget<DiagramConfiguration> {
    return DynamicDiagramConfiguration;
  }

  protected bindSourceModelStorage(): BindingTarget<SourceModelStorage> {
    return DynamicStorage;
  }

  protected bindModelState(): BindingTarget<ModelState> {
    return { service: DynamicModelState };
  }

  protected bindGModelFactory(): BindingTarget<GModelFactory> {
    return { service: DynamicGModelFactory };
  }

  protected override bindGModelIndex(): BindingTarget<GModelIndex> {
    this.context.bind(DynamicModelIndex).toSelf().inSingletonScope();
    return { service: DynamicModelIndex };
  }

  protected override bindLabelEditValidator(): BindingTarget<LabelEditValidator> | undefined {
    return DynamicLabelEditValidator;
  }

  //   protected override bindCommandPaletteActionProvider(): BindingTarget<CommandPaletteActionProvider> | undefined {
  //     return CommandPaletteActionProvider;
  //   }

  protected override configureActionHandlers(binding: InstanceMultiBinding<ActionHandlerConstructor>): void {
    super.configureActionHandlers(binding);
    binding.add(ComputedBoundsActionHandler);
    binding.add(DynamicRequestClipboardDataActionHandler);
  }

  protected override configureOperationHandlers(binding: InstanceMultiBinding<OperationHandlerConstructor>): void {
    super.configureOperationHandlers(binding);
    binding.add(DynamicCreateNodeOperationHandler);
    binding.add(DynamicCreateEdgeOperationHandler);
    binding.add(DynamicDeleteElementOperationHandler);
    binding.add(DynamicChangeBoundsOperationHandler);
    binding.add(DynamicChangeRoutingPointsOperationHandler);
    binding.add(DynamicReconnectEdgeOperationHandler);
    binding.add(DynamicApplyLabelEditOperationHandler);
    binding.add(DynamicCutOperationHandler);
    binding.add(DynamicPasteOperationHandler);
  }
}
