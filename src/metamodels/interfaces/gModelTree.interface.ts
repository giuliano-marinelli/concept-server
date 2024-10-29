export interface GModelTree {
  type: 'node' | 'edge';
  children: GModelElement[];
}

export interface GModelElement {
  type: string;
  children: GModelElement[];
}
