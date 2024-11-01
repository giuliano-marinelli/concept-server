import { DefaultTypes as types } from '@eclipse-glsp/protocol';
import {
  DefaultTypes,
  DiagramConfiguration,
  EdgeTypeHint,
  GButton,
  GCompartment,
  GEdge,
  GGraph,
  GHtmlRoot,
  GIssueMarker,
  GLabel,
  GModelElement,
  GModelElementConstructor,
  GNode,
  GPort,
  GPreRenderedElement,
  GShapedPreRenderedElement,
  ServerLayoutKind,
  ShapeTypeHint
} from '@eclipse-glsp/server';

import { injectable } from 'inversify';

@injectable()
export class DynamicDiagramConfiguration implements DiagramConfiguration {
  layoutKind = ServerLayoutKind.MANUAL;
  needsClientLayout = true;
  animatedUpdate = true;

  get typeMapping(): Map<string, GModelElementConstructor<GModelElement>> {
    const mapping = new Map<string, GModelElementConstructor>();
    mapping.set(types.GRAPH, GGraph);
    mapping.set(types.NODE, GNode);
    mapping.set(types.EDGE, GEdge);
    mapping.set(types.PORT, GPort);
    mapping.set(types.LABEL, GLabel);
    mapping.set(types.COMPARTMENT, GCompartment);
    mapping.set(types.BUTTON, GButton);
    mapping.set(types.ISSUE_MARKER, GIssueMarker);

    mapping.set(types.HTML, GHtmlRoot);
    mapping.set(types.PRE_RENDERED, GPreRenderedElement);
    mapping.set(types.FOREIGN_OBJECT, GShapedPreRenderedElement);
    return mapping;
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
