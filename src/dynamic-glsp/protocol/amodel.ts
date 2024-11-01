export enum Type {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  EMUM = 'enum',
  ARRAY = 'array',
  OBJECT = 'object'
}

export enum EnumStyle {
  SELECT = 'select',
  RADIO = 'radio'
}

export interface EnumValue {
  value: string;
  label: string;
}

export interface AModelElementSchema {
  type: Type;
  name: string;
  label?: string;
}

export interface AModelEnumSchema extends AModelElementSchema {
  type: Type.EMUM;
  style: EnumStyle;
  values: EnumValue[];
}

export interface AModelArraySchema extends AModelElementSchema {
  type: Type.ARRAY;
  items: AModelElementSchema;
  default: any;
}

export interface AModelObjectSchema extends AModelElementSchema {
  type: Type.OBJECT;
  properties: AModelElementSchema[];
}

export interface AModelRootSchema extends AModelObjectSchema {}
