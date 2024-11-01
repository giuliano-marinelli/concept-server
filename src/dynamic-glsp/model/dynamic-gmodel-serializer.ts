import {
  DefaultGModelSerializer,
  GLSPServerError,
  GModelElement,
  GModelElementSchema,
  GModelRoot,
  GModelRootSchema
} from '@eclipse-glsp/server';

import { DynamicDiagramConfiguration } from '../diagram/dynamic-diagram-configuration';
import { inject } from 'inversify';
import * as uuid from 'uuid';

export class DynamicGModelSerializer extends DefaultGModelSerializer {
  @inject(DynamicDiagramConfiguration) protected diagramConfiguration: DynamicDiagramConfiguration;

  override createElement(gModel: GModelElementSchema, parent?: GModelElement, model?: any): GModelElement {
    const constructor = this.getConfiguredConstructor(gModel);
    if (constructor) {
      const element = new constructor();
      if (element instanceof GModelRoot) {
        throw new GLSPServerError(
          `Element with type '${gModel.type}' is a GModelRoot! 'createElement()' is expected to only create child elements!`
        );
      }
      return this.initializeChild(element, gModel, parent, model);
    }
    throw new GLSPServerError(`No constructor is configured in DiagramConfiguration for type ${gModel.type}`);
  }

  // gets the default model value object and the autoincrement value and returns the object with the autoincrement value set
  processAutoincrement(defaultModel: any, autoincrement?: number): any {
    if (!defaultModel) return {};
    return JSON.parse(
      JSON.stringify(defaultModel).replace(
        /\${autoincrement}/g,
        autoincrement != undefined ? autoincrement.toString() : ''
      )
    );
  }

  // gets the variables declared as ${varname} in the value and replaces them with the values from the bindings
  proccessBindingString(bindingString: string, model: any): string {
    return bindingString.replace(/\${(.*?)}/g, (match, varname) => {
      return model?.model[varname];
    });
  }

  // returns the variable name from the binding string
  getBindingVariable(bindingString: string): string {
    const match = bindingString.match(/\${(.*?)}/);
    return match ? match[1] : undefined;
  }

  protected override initializeElement(element: GModelElement, gModel: GModelRootSchema, model?: any): GModelElement {
    for (const key in gModel) {
      if (!this.isReserved(element, key)) {
        const value = (gModel as any)[key];
        if (typeof value !== 'function') {
          // here we have to translate binding variables to values if they are used in the schema
          if (typeof value === 'string' && value.includes('$')) {
            (element as any)[key] = this.proccessBindingString(value, model);
            // add argument for flag that the element property is bind to a model property
            if (!gModel['args']) element.args = {};
            if (!element.args) element.args = {};
            gModel['args'] = { ...gModel['args'], [key + 'Bind']: value };
            element.args = { ...element.args, [key + 'Bind']: value };
          } else {
            (element as any)[key] = value;
          }
        }
      }
    }
    return element;
  }

  protected override initializeChild(
    child: GModelElement,
    gModel: GModelElementSchema,
    parent?: GModelElement,
    model?: any
  ): GModelElement {
    this.initializeParent(child, gModel, model);
    if (parent) {
      child.parent = parent;
      child.id = parent.id + '_' + uuid.v4();
    }
    return child;
  }

  protected override initializeParent(parent: GModelElement, gModel: GModelElementSchema, model?: any): GModelElement {
    this.initializeElement(parent, gModel, model);
    if (gModel.children) {
      parent.children = gModel.children.map((childSchema) => this.createElement(childSchema, parent, model));
    }

    return parent;
  }
}
