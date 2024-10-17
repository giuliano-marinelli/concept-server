export interface Service {
  [key: string]: (...args: any[]) => any;
}

export const ExternalServices = Symbol('ExternalServices');

export interface ExternalServices {
  [key: string]: any;
}
