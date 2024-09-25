import {
  DefaultTypes,
  DiagramConfiguration,
  EdgeTypeHint,
  GModelElement,
  GModelElementConstructor,
  ServerLayoutKind,
  ShapeTypeHint,
  getDefaultMapping
} from '@eclipse-glsp/server';

import { injectable } from 'inversify';

@injectable()
export class DynamicDiagramConfiguration implements DiagramConfiguration {
  layoutKind = ServerLayoutKind.MANUAL;
  needsClientLayout = true;
  animatedUpdate = true;

  get typeMapping(): Map<string, GModelElementConstructor<GModelElement>> {
    return getDefaultMapping();
  }

  get shapeTypeHints(): ShapeTypeHint[] {
    return [
      {
        elementTypeId: DefaultTypes.NODE,
        deletable: true,
        reparentable: false,
        repositionable: true,
        resizable: true
      }
    ];
  }

  get edgeTypeHints(): EdgeTypeHint[] {
    return [
      {
        elementTypeId: DefaultTypes.EDGE,
        deletable: true,
        repositionable: true,
        routable: true,
        sourceElementTypeIds: [DefaultTypes.NODE],
        targetElementTypeIds: [DefaultTypes.NODE]
      }
    ];
  }
}
