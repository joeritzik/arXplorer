import { Author } from './Dict';

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type GraphNode = {
  id: string;
  weight: number;
  group: number;
  cat: string;
  cat_name: string;
};

// id: string;
//     weight: number;
//     group: any;
//     cat: string;
//     cat_name: any;

export type GraphLink = {
  source: string;
  target: string; // why is this not author?
  //   value: number;
};
