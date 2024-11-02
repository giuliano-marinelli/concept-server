import {
  DefaultGModelSerializer,
  GCompartment,
  GLSPServerError,
  GModelElement,
  GModelElementSchema,
  GModelRoot,
  GModelRootSchema
} from '@eclipse-glsp/server';

import { DynamicDiagramConfiguration, DynamicTypes } from '../diagram/dynamic-diagram-configuration';
import { GIteration } from '../protocol/giteration';
import { inject } from 'inversify';
import * as uuid from 'uuid';

export class DynamicGModelSerializer extends DefaultGModelSerializer {
  @inject(DynamicDiagramConfiguration) protected diagramConfiguration: DynamicDiagramConfiguration;

  override createElement(
    gModel: GModelElementSchema,
    parent?: GModelElement,
    model?: any,
    path: string = '',
    iterand?: string,
    identifier?: string
  ): GModelElement {
    const constructor = this.getConfiguredConstructor(gModel);
    if (constructor) {
      const element = new constructor();
      if (element instanceof GModelRoot) {
        throw new GLSPServerError(
          `Element with type '${gModel.type}' is a GModelRoot! 'createElement()' is expected to only create child elements!`
        );
      }
      return this.initializeChild(element, gModel, parent, model, path, iterand, identifier);
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

  // gets the variables declared as ${varpath} in the value and replaces them with the values from the bindings
  processBindingString(bindingString: string, model: any, path?: string, iterand?: string): any {
    // traverse the model object to getall values between ${} in the string taking into account nested objects
    // e.g. varpath = 'persona.nombre' -> model['persona']['nombre']
    // e.g. varpath = 'persona.nombres[0]' -> model['persona']['nombres'][0]
    const bindingVar = this.getBindingVariable(bindingString, path, iterand);
    const varpath = bindingVar.split('.');
    if (varpath) {
      const value = varpath.reduce((acc, key) => {
        if (key.includes('[')) {
          const index = parseInt(key.match(/\[(.*?)\]/)[1]);
          return acc?.[key.split('[')[0]][index];
        } else return acc?.[key];
      }, model);
      return value;
    }
    return undefined;
  }

  // returns the variable name from the binding string
  // if the binding string includes the iterand, it's replaced by the path
  // e.g. bindingString = '${class.attributes}' -> 'class.attributes'
  // e.g. bindingString = '${attribute.name}', path = 'class.attributes[0]', iterand = 'attribute' -> 'class.attributes[0].name'
  getBindingVariable(bindingString: string, path?: string, iterand?: string): string {
    // get string between ${}
    const match = bindingString.match(/\${(.*?)}/);
    if (match) {
      let varpath = match[1];
      // replace iterand with path if it's defined
      if (iterand) {
        varpath = varpath.replace(iterand, path);
      }
      return varpath;
    }
    // const match = bindingString.match(/\${(.*?)}/);
    // return match ? match[1] : undefined;
  }

  // sets the value in a model object traversing it with the path and putting the value in the last key
  setBindingVariable(model: any, path: string, value: any): void {
    const keys = path.split('.');
    keys.reduce((acc, key, index) => {
      if (key.includes('[')) {
        const index = parseInt(key.match(/\[(.*?)\]/)[1]);
        if (index == keys.length - 1) {
          acc[key.split('[')[0]][index] = value;
          return;
        }
        return acc?.[key.split('[')[0]][index];
      } else {
        if (index == keys.length - 1) {
          acc[key] = value;
          return;
        }
        return acc?.[key];
      }
    }, model);
  }

  // add to path
  // e.g. previousPath = '', currentItem = 'attributes' -> 'attributes'
  // e.g. previousPath = 'class', currentItem = 'attributes' -> 'class.attributes'
  // e.g. previousPath = 'class', currentItem = 'attributes', index = 0 -> 'class.attributes[0]'
  compoundPath(previousPath: string, currentItem: string, index?: number): string {
    return (
      (previousPath?.length ? previousPath + '.' : '') +
      (index != undefined ? currentItem + '[' + index + ']' : currentItem)
    );
  }

  protected override initializeElement(
    element: GModelElement,
    gModel: GModelRootSchema,
    model?: any,
    path?: string,
    iterand?: string
  ): GModelElement {
    for (const key in gModel) {
      if (!this.isReserved(element, key)) {
        const value = (gModel as any)[key];
        if (typeof value !== 'function') {
          // here we have to translate binding variables to values if they are used in the schema
          if (typeof value === 'string' && value.includes('$')) {
            (element as any)[key] = this.processBindingString(value, model, path, iterand);
            // add argument for flag that the element property is bind to a model property
            if (!gModel['args']) element.args = {};
            if (!element.args) element.args = {};
            // create keyBind variable full path
            const keyBind = this.getBindingVariable(value, path, iterand);
            gModel['args'] = { ...gModel['args'], [key + 'Bind']: keyBind };
            element.args = { ...element.args, [key + 'Bind']: keyBind };
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
    model?: any,
    path?: string,
    iterand?: string,
    identifier?: string
  ): GModelElement {
    if (child.type == DynamicTypes.ITERATION) {
      if (!parent) {
        throw new GLSPServerError(`Iteration element must have a parent.`);
      }

      const iteration = gModel as GIteration;
      const iterable = this.processBindingString(iteration.iterable, model);

      if (iterable) {
        // check if iterable is an array
        if (!Array.isArray(iterable)) {
          throw new GLSPServerError(`Iteration iterable must be an array.`);
        }

        // add iterable elements to the parent children list
        parent.children = [
          ...parent.children,
          ...iterable.map((modelItem, index) => {
            return this.createElement(
              iteration.template,
              parent,
              model,
              this.compoundPath(path, this.getBindingVariable(iteration.iterable), index),
              iteration.iterand,
              identifier + '_' + (iteration.iterand ?? 'iterand') + index
            );
          })
        ];
      }

      return undefined;
    } else {
      if (parent) {
        child.parent = parent;
        child.id = parent.id + '_' + identifier;
      }
      this.initializeParent(child, gModel, model, path, iterand);
      return child;
    }
  }

  protected override initializeParent(
    parent: GModelElement,
    gModel: GModelElementSchema,
    model?: any,
    path?: string,
    iterand?: string
  ): GModelElement {
    this.initializeElement(parent, gModel, model, path, iterand);
    if (gModel.children) {
      parent.children = [];
      gModel.children.forEach((childSchema, index) => {
        const child = this.createElement(childSchema, parent, model, path, iterand, 'child' + index);
        if (child) parent.children.push(child);
      });
    }

    return parent;
  }
}
