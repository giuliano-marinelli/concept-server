import { GModelElement } from '@eclipse-glsp/server';

import { DynamicTypes } from '../diagram/dynamic-diagram-configuration';

export class GDecision extends GModelElement {
  override type = DynamicTypes.DECISION;

  condition: string;
}
