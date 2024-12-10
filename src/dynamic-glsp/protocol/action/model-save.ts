import { Action, SaveModelAction as DefaultSaveModelAction } from '@eclipse-glsp/protocol';

export interface SaveModelAction extends DefaultSaveModelAction {
  preview?: string;
}

export namespace SaveModelAction {
  export const KIND = 'saveModel';

  export function is(object: unknown): object is SaveModelAction {
    return Action.hasKind(object, KIND);
  }

  export function create(options: { fileUri?: string; preview?: string } = {}): SaveModelAction {
    return {
      kind: KIND,
      ...options
    };
  }
}
