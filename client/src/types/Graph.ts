export default interface Graph {
  // svg: {
  //     width: number,
  //     height: number,
  // }
  //   offsetX: number;
  //   offsetY: number;
  nodes: Node;
  links: Link;
}

export type Node = {
  id: Author;
  weight: number;
  group: number;
  cat: [cat: string];
  cat_name: string;
};

export type Link = {
  source: string;
  target: string;
  value: number;
};

type Author = {
  id: string;
};
