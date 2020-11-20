export default interface Graph {
  // svg: {
  //     width: number,
  //     height: number,
  // }
  offsetX: number;
  offsetY: number;
  node: Node[];
  link: Link[];
}

export type Node = {
  id: string;
  group: number;
};

export type Link = {
  source: string;
  target: string;
  value: number;
};
