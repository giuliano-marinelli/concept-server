import { GModelElement } from '@eclipse-glsp/server';

import { DynamicTypes } from '../diagram/dynamic-diagram-configuration';

export interface BooleanCondition {
  left: string | number | boolean; // string can be a variable name
  right: string | number | boolean | string[] | number[] | [number, number]; // string can be a variable name
}

export interface BooleanExpression {
  eq?: BooleanCondition;
  ne?: BooleanCondition;
  gt?: BooleanCondition;
  gte?: BooleanCondition;
  lt?: BooleanCondition;
  lte?: BooleanCondition;
  in?: BooleanCondition;
  any?: BooleanCondition;
  between?: BooleanCondition;
  and?: BooleanExpression[];
  or?: BooleanExpression[];
  not?: BooleanExpression;
}

export class GDecision extends GModelElement {
  override type = DynamicTypes.DECISION;

  condition: BooleanExpression;
  then: GModelElement;
  else?: GModelElement;
}
