import { Operation, hasObjectProp, hasStringProp } from '@eclipse-glsp/protocol';

/**
 * Interface {@link Operation} for change a model attribute of a element.
 * The corresponding namespace offers a helper function for type guard checks.
 */
export interface ChangeModelOperation extends Operation {
  kind: typeof ChangeModelOperation.KIND;

  /**
   * The id of the element that contains the model to change.
   */
  elementId: string;

  /**
   * The new model of the element.
   */
  newModel: any;
}

export namespace ChangeModelOperation {
  export const KIND = 'modelChange';

  export function is(object: unknown): object is ChangeModelOperation {
    return Operation.hasKind(object, KIND) && hasStringProp(object, 'elementId') && hasObjectProp(object, 'newValue');
  }

  export function create(options: { elementId: string; newModel: any }): ChangeModelOperation {
    return {
      kind: KIND,
      isOperation: true,
      ...options
    };
  }
}
