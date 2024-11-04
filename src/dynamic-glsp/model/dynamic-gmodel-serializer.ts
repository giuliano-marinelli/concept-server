import {
  DefaultGModelSerializer,
  GLSPServerError,
  GModelElement,
  GModelElementSchema,
  GModelRoot,
  GModelRootSchema
} from '@eclipse-glsp/server';

import { DynamicDiagramConfiguration, DynamicTypes } from '../diagram/dynamic-diagram-configuration';
import { BooleanCondition, BooleanExpression, GDecision } from '../protocol/gdecision';
import { GIteration } from '../protocol/giteration';
import { inject } from 'inversify';

/**
 * The `DynamicGModelSerializer` class extends the `DefaultGModelSerializer` to provide
 * additional functionality for creating and initializing dynamic graphical model elements.
 *
 * @extends DefaultGModelSerializer
 *
 * @property {DynamicDiagramConfiguration} diagramConfiguration - Injected configuration for the dynamic diagram.
 *
 * @method createElement
 * @description Creates a new graphical model element based on the provided schema and initializes it.
 * @param {GModelElementSchema} gModel - The schema of the graphical model element to create.
 * @param {GModelElement} [parent] - The parent element of the new element.
 * @param {any} [model] - The model data used for binding.
 * @param {string} [path=''] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @param {string} [identifier] - The identifier for the new element.
 * @returns {GModelElement} The created and initialized graphical model element.
 *
 * @method processAutoincrement
 * @description Processes the autoincrement value in the default model and returns the updated model.
 * @param {any} defaultModel - The default model value object.
 * @param {number} [autoincrement] - The autoincrement value to set.
 * @returns {any} The updated model with the autoincrement value set.
 *
 * @method processBindingString
 * @description Processes the binding string and replaces variables with values from the model.
 * @param {string} bindingString - The binding string containing variables.
 * @param {any} model - The model data used for binding.
 * @param {string} [path] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @returns {any} The value obtained from the model based on the binding string.
 *
 * @method processBooleanExpression
 * @description Evaluates a boolean expression based on the conditions and values of the model.
 * @param {BooleanExpression} condition - The boolean expression to evaluate.
 * @param {any} model - The model data used for evaluation.
 * @param {string} [path] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @returns {boolean} The result of the boolean expression evaluation.
 *
 * @method processBooleanCondition
 * @description Evaluates a boolean condition based on the operator and the values of the left and right operands.
 * @param {BooleanCondition} condition - The boolean condition to evaluate.
 * @param {any} model - The model data used for evaluation.
 * @param {string} [path] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @param {string} [operator] - The operator used in the condition.
 * @returns {boolean} The result of the boolean condition evaluation.
 *
 * @method processBooleanConditionValue
 * @description Returns the value of the condition based on the type of the value.
 * @param {string | number | boolean | string[] | number[] | [number, number]} value - The value to process.
 * @param {any} model - The model data used for evaluation.
 * @param {string} [path] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @returns {string | number | boolean | string[] | number[] | [number, number]} The processed value.
 *
 * @method getBindingVariable
 * @description Returns the variable name from the binding string.
 * @param {string} bindingString - The binding string containing the variable.
 * @param {string} [path] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @returns {string} The variable name extracted from the binding string.
 *
 * @method setBindingVariable
 * @description Sets the value in a model object by traversing it with the path and putting the value in the last key.
 * @param {any} model - The model object to update.
 * @param {string} path - The path to the property to set.
 * @param {any} value - The value to set.
 *
 * @method compoundPath
 * @description Constructs a compound path by appending the current item to the previous path.
 * @param {string} previousPath - The previous path.
 * @param {string} currentItem - The current item to append.
 * @param {number} [index] - The index for array elements.
 * @returns {string} The constructed compound path.
 *
 * @method initializeElement
 * @description Initializes a graphical model element based on the provided schema and model data.
 * @param {GModelElement} element - The element to initialize.
 * @param {GModelRootSchema} gModel - The schema of the graphical model element.
 * @param {any} [model] - The model data used for binding.
 * @param {string} [path] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @returns {GModelElement} The initialized graphical model element.
 *
 * @method initializeChild
 * @description Initializes a child graphical model element based on the provided schema and model data.
 * @param {GModelElement} child - The child element to initialize.
 * @param {GModelElementSchema} gModel - The schema of the graphical model element.
 * @param {GModelElement} [parent] - The parent element of the child.
 * @param {any} [model] - The model data used for binding.
 * @param {string} [path] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @param {string} [identifier] - The identifier for the child element.
 * @returns {GModelElement} The initialized child graphical model element.
 *
 * @method initializeParent
 * @description Initializes a parent graphical model element based on the provided schema and model data.
 * @param {GModelElement} parent - The parent element to initialize.
 * @param {GModelElementSchema} gModel - The schema of the graphical model element.
 * @param {any} [model] - The model data used for binding.
 * @param {string} [path] - The path to the current element in the model.
 * @param {string} [iterand] - The iterand variable name for iteration elements.
 * @returns {GModelElement} The initialized parent graphical model element.
 */
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

  /**
   * Gets the default model value object and the autoincrement value and returns the object with the autoincrement value set.
   *
   * e.g. defaultModel = { name: 'element_${autoincrement}' }, autoincrement = 1 -> { name: 'element_1' }
   */
  processAutoincrement(defaultModel: any, autoincrement?: number): any {
    if (!defaultModel) return {};
    return JSON.parse(
      JSON.stringify(defaultModel).replace(
        /\${autoincrement}/g,
        autoincrement != undefined ? autoincrement.toString() : ''
      )
    );
  }

  /**
   * Gets the variables declared as ${varpath} in the bindingString and replaces them with the values from the bindings.
   */
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

  /**
   * Returns the boolean value of the expression based on the conditions and values of the model.
   *
   * If anything goes wrong, it returns false.
   */
  processBooleanExpression(condition: BooleanExpression, model: any, path?: string, iterand?: string): boolean {
    if (condition.eq) {
      return this.processBooleanCondition(condition.eq, model, path, iterand, 'eq');
    } else if (condition.ne) {
      return this.processBooleanCondition(condition.ne, model, path, iterand, 'ne');
    } else if (condition.gt) {
      return this.processBooleanCondition(condition.gt, model, path, iterand, 'gt');
    } else if (condition.gte) {
      return this.processBooleanCondition(condition.gte, model, path, iterand, 'gte');
    } else if (condition.lt) {
      return this.processBooleanCondition(condition.lt, model, path, iterand, 'lt');
    } else if (condition.lte) {
      return this.processBooleanCondition(condition.lte, model, path, iterand, 'lte');
    } else if (condition.in) {
      return this.processBooleanCondition(condition.in, model, path, iterand, 'in');
    } else if (condition.any) {
      return this.processBooleanCondition(condition.any, model, path, iterand, 'any');
    } else if (condition.between) {
      return this.processBooleanCondition(condition.between, model, path, iterand, 'between');
    } else if (condition.and) {
      return condition.and.every((c) => this.processBooleanExpression(c, model, path, iterand));
    } else if (condition.or) {
      return condition.or.some((c) => this.processBooleanExpression(c, model, path, iterand));
    } else if (condition.not) {
      return !this.processBooleanExpression(condition.not, model, path, iterand);
    }
    return false;
  }

  /**
   * Return the boolean value of the condition based on the operator and the values of the left and right.
   *
   * If the values are strings, they are checked if they are variables and replaced by the values in the model.
   *
   * If anything goes wrong, it returns false
   */
  processBooleanCondition(
    condition: BooleanCondition,
    model: any,
    path?: string,
    iterand?: string,
    operator?: string
  ): boolean {
    try {
      const left = this.processBooleanConditionValue(condition.left, model, path, iterand);
      const right = this.processBooleanConditionValue(condition.right, model, path, iterand);

      switch (operator) {
        case 'eq':
          return left == right;
        case 'ne':
          return left != right;
        case 'gt':
          return left > right;
        case 'gte':
          return left >= right;
        case 'lt':
          return left < right;
        case 'lte':
          return left <= right;
        case 'in':
          // check if left is string and right is array of strings
          if (typeof left === 'string' && Array.isArray(right)) return (right as string[])?.includes(left as string);
          // check if left is number and right is array of numbers
          if (typeof left === 'number' && Array.isArray(right)) return (right as number[])?.includes(left as number);
        case 'any':
          // check if left is string and right is array of strings
          if (typeof left === 'string' && Array.isArray(right))
            return (right as string[])?.some((r) => r == (left as string));
          // check if left is number and right is array of numbers
          if (typeof left === 'number' && Array.isArray(right))
            return (right as number[])?.some((r) => r == (left as number));
        case 'between':
          // check if left is number and right is array with two numbers
          if (typeof left === 'number' && Array.isArray(right) && right.length == 2)
            return (
              (left as number) >= (right as [number, number])[0] && (left as number) <= (right as [number, number])[1]
            );
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Returns the value of the condition based on the type of the value.
   *
   * If the value is a string, it's checked if it's a variable and replaced by the value in the model
   */
  processBooleanConditionValue(
    value: string | number | boolean | string[] | number[] | [number, number],
    model: any,
    path?: string,
    iterand?: string
  ): string | number | boolean | string[] | number[] | [number, number] {
    if (typeof value === 'string') {
      return this.processBindingString(value, model, path, iterand);
    } else {
      return value;
    }
  }

  /**
   * Returns the variable name from the binding string.
   *
   * If the binding string includes the iterand, it's replaced by the path.
   *
   * e.g. bindingString = '${class.attributes}' -> 'class.attributes'
   *
   * e.g. bindingString = '${attribute.name}', path = 'class.attributes[0]', iterand = 'attribute' -> 'class.attributes[0].name'
   */
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

  /**
   * Sets the value in a model object traversing it with the path and putting the value in the last key.
   */
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

  /**
   * Add to path.
   *
   * e.g. previousPath = '', currentItem = 'attributes' -> 'attributes'
   *
   * e.g. previousPath = 'class', currentItem = 'attributes' -> 'class.attributes'
   *
   * e.g. previousPath = 'class', currentItem = 'attributes', index = 0 -> 'class.attributes[0]'
   */
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
    }
    if (child.type == DynamicTypes.DECISION) {
      if (!parent) {
        throw new GLSPServerError(`Decision element must have a parent.`);
      }

      const decision = gModel as GDecision;
      const condition = this.processBooleanExpression(decision.condition, model);

      // add the child to the parent children list if the condition is true
      // otherwise add the else child if it exists
      if (condition) {
        parent.children = [
          ...parent.children,
          this.createElement(decision.then, parent, model, path, iterand, identifier)
        ];
      } else if (decision.else) {
        parent.children = [
          ...parent.children,
          this.createElement(decision.else, parent, model, path, iterand, identifier)
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
