import { Utils } from './utils';
import { Engine } from './engine';
import { Lane } from './lane';

export class JunctionLane extends Lane {
  crossingLanes: Lane[];
  yieldToLanes: Lane[];

  constructor(id, fromLane, toLane) {
    let intersection = Utils.getIntersection(
      fromLane.endPoint, fromLane.endAngle,
      toLane.startPoint, toLane.startAngle
    );
    // junction lanes hardcoded to be quadratic curves
    super(id, fromLane.endPoint, toLane.startPoint, [{x: intersection[0],y: intersection[1]}]);

    this.yieldToLanes = [];
    this.crossingLanes = [];

    this.tags.push('JUNCTION');
    fromLane.nextLanes.push(this);
    toLane.prevLanes.push(this);
    this.prevLanes.push(fromLane);
    this.nextLanes.push(toLane);
  }

  yieldToLane(lane) {
    this.yieldToLanes.push(lane);
    this.crossingLanes.push(lane);
    lane.crossingLanes.push(this);
  }



}