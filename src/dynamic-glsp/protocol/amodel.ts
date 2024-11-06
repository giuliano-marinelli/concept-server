export enum Type {
  STRING = 'string',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object'
}

export enum EnumStyle {
  SELECT = 'select',
  RADIO = 'radio'
}

export interface AModelElementSchema {
  type: Type;
  label?: string;
  default?: any;
}

export interface AModelEnumSchema extends AModelElementSchema {
  type: Type.STRING;
  enum?: string[];
  oneOf?: [{ const: string; title: string }];
}

export interface AModelArraySchema extends AModelElementSchema {
  type: Type.ARRAY;
  items: AModelElementSchema;
}

export interface AModelObjectSchema extends AModelElementSchema {
  type: Type.OBJECT;
  properties: {
    [propertyName: string]: AModelElementSchema;
  };
}

export interface AModelRootSchema extends AModelObjectSchema {}
