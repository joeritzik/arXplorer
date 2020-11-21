'use strict';

import {
  D3DragEvent,
  drag,
  DragBehavior,
  scaleOrdinal,
  schemePaired,
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from 'd3';
import { DragEvent } from 'react';
import { Node, Link } from '../../types/Graph';
// React.DragEvent<HTMLDivElement>

// interface DragEvent {
//   active: boolean;
//   subject: any;
//   x: any;
//   y: any;
//   dx: any;
//   dy:any;
// }

interface Data {
  group: any;
}

//simulation
// selection, offetx and y

export const dragFunc = (
  simulation: Simulation<
    SimulationNodeDatum,
    SimulationLinkDatum<NodeDatum> | undefined
  >
) => {
  function dragStarted(event: any): void {
    if (!event.active) simulation.alphaTarget(0.5).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  return drag()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded);
};

export const backgroundDrag = (selection, offsetX, offsetY) => {
  function dragStarted() {
    return undefined;
  }

  function dragged(event: any): void {
    offsetX -= event.dx;
    offsetY -= event.dy;
    selection
      .selectAll('g.nodes')
      .attr('transform', `translate(${-offsetX}, ${-offsetY})`);
  }

  function dragEnded() {
    return undefined;
  }

  return drag()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded);
};

export const color = () => {
  const scale = scaleOrdinal(schemePaired);
  return (d: Data) => scale(d.group);
};
