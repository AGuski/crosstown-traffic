import { CanvasObject } from './canvas-object';
import { Car } from './car';

export class Lane extends CanvasObject {
  
  startAngle: number;
  endAngle: number;

  prevLanes: Lane[] = [];
  nextLanes: Lane[] = [];

  tags: string[] = [];

  cars: Car[] = [];

  length: number;
  actors : any[] = [];

  constructor(public id, public startPoint, public endPoint, public controlPoints?) {
    super({
      pathString: Lane.getPathString(
        startPoint, 
        endPoint,
        controlPoints
      ),
      group: 'laneElementGroup'
    });

    // angle in radians
    this.startAngle = this.getStartAngleByControlPoints();
    this.endAngle = this.getEndAngleByControlPoints();

    this.element.attr({
      fill: 'transparent',
        stroke: '#666',
        strokeWidth: 7
    });

    this.length = Math.round(this.element.getTotalLength());

    // start Maker for development //
    // s.circle(startPoint.x, startPoint.y, 5).attr({fill: '#00dd00'});

    // this.info = s.text(
    //   this.element.getBBox().cx,
    //   this.element.getBBox().cy,
    //   `${this.id}`
    // ).attr({
    //   fill: '#22cc22',
    //   style: `font-size: 12px; font-family: arial; `
    // });
  }

  getStartAngleByControlPoints() {
    if(!this.controlPoints || this.controlPoints.length === 0) {
      return Math.atan2(this.startPoint.y-this.endPoint.y, this.startPoint.x-this.endPoint.x);
    }
    if(this.controlPoints.length === 1) {
      return Math.atan2(this.startPoint.y-this.controlPoints[0].y, this.startPoint.x-this.controlPoints[0].x)
    }
    if(this.controlPoints.length === 2) {
      return Math.atan2(this.startPoint.y-this.controlPoints[0].y, this.startPoint.x-this.controlPoints[0].x)
    }
  }

  getEndAngleByControlPoints() {
    if(!this.controlPoints || this.controlPoints.length === 0) {
      return Math.atan2(this.endPoint.y-this.startPoint.y, this.endPoint.x-this.startPoint.x);
    }
    if(this.controlPoints.length === 1) {
      return Math.atan2(this.endPoint.y-this.controlPoints[0].y, this.endPoint.x-this.controlPoints[0].x)
    }
    if(this.controlPoints.length === 2) {
      return Math.atan2(this.endPoint.y-this.controlPoints[1].y, this.endPoint.x-this.controlPoints[1].x)
    }
  }

  static getPathString(startPoint, endPoint, controlPoints) {
    if(!controlPoints || controlPoints.length === 0) {
      return `M${startPoint.x} ${startPoint.y} L${endPoint.x} ${endPoint.y}`;
    }
    if(controlPoints.length === 1) {
      return `
        M${startPoint.x} ${startPoint.y} 
        Q${controlPoints[0].x} ${controlPoints[0].y}, 
        ${endPoint.x} ${endPoint.y}
      `;
    }
    if(controlPoints.length === 2) {
      return `
        M${startPoint.x} ${startPoint.y} 
        C${controlPoints[0].x} ${controlPoints[0].y}, 
        ${controlPoints[1].x} ${controlPoints[1].y}, 
        ${endPoint.x} ${endPoint.y}
      `;
    }
  }

  add(actor, length) {
    this.actors.push({lanePos: length, actor: actor});
  }
}