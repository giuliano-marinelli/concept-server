import { Operation } from '@eclipse-glsp/protocol';

/**
 * Interface {@link Operation} for refresh the model to be re-rendered.
 * The corresponding namespace offers a helper function for type guard checks.
 */
export interface RefreshModelOperation extends Operation {
  kind: typeof RefreshModelOperation.KIND;
}

export namespace RefreshModelOperation {
  export const KIND = 'refreshModel';

  export function is(object: unknown): object is RefreshModelOperation {
    return Operation.hasKind(object, KIND);
  }

  export function create(): RefreshModelOperation {
    return {
      kind: KIND,
      isOperation: true
    };
  }
}
