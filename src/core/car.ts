import { JunctionLane } from './junction-lane';
import { Lane } from './lane';
import { Utils } from './utils';
import { CanvasObject } from './canvas-object';

export class Car extends CanvasObject {

  lanePos: any;
  crashed: boolean;
  carAhead: boolean;
  idle: boolean;
  routeIndicator: any;
  displayRoute: boolean;
  useNavigation: boolean;
  route: any[];
  speed: number;
  maxSpeed: number;

  constructor(public id, public lane: Lane, public position) {

    // This could also be done by @Decorator on the class?! (like they do in angular)
    super({
      pathString: Car.getCarPathString(0, 0, 7),
      group: 'carElementGroup'
    });

    this.id = id;
    this.setLane(lane, position);
    this.maxSpeed = 1 + Math.random()*2;
    this.speed = 0;

    this.route = [];
    this.useNavigation = true;
    this.displayRoute = false;
    this.routeIndicator;

    this.idle = false;
    this.carAhead = false;

    this.crashed = false;

    const startPoint = lane.element.getPointAtLength(this.lanePos);
    this.element.transform(`t${startPoint.x}, ${startPoint.y}`);

    if (this.useNavigation) {
      const exitLanes = [1, 5, 7, 9, 25]
      let t = exitLanes[Math.floor(Math.random()*exitLanes.length)];  // <- select random exit
      // let t = 7;
      this.planRouteTo(this.engine.world.lanes[t], this.engine.world.lanes[t].length);
      // if no route was found, drive randomly
      if (this.route.length === 0) {
        this.useNavigation = false;
      }
    }

    if (this.displayRoute) {
      this.route.forEach(lane => {
        lane.element.clone().attr({
          fill: 'transparent',
          stroke: '#ff5555',
          opacity: .9,
          strokeWidth: 3
        });
      });
    }
  }

  get currentRouteIndex() {
    return this.route.findIndex(lane => lane.id === this.lane.id);
  }

  static getCarPathString(cx,cy,r) {
    let p = "M" + cx + "," + cy;
    p += "m" + -r + ",0";
    p += "a" + r + "," + r + " 0 1,0 " + (r*2) +",0";
    p += "a" + r + "," + r + " 0 1,0 " + -(r*2) + ",0";
    return p;
  }

  planRouteTo(lane, position) {
    const targetLane = lane;
    const targetPosition = position; // <-- currently not used 

    function getRouteLength(route) {
      length = 0;
      route.forEach(lane => {
        length += lane.length;
      });
      return length;
    }

    function addLaneToRoute(lane, usedLanes) {
      if (lane.id === targetLane.id) {
        return [lane];
      } else if (lane.nextLanes.length === 0 || usedLanes.find(usedLane => usedLane.id === lane.id)) {
        return [];
      } else {
        usedLanes.push(lane);
        let shortestChildRouteLength;
        let currentRoute = [];
        lane.nextLanes.forEach(childLane => {
          let childRoute = addLaneToRoute(childLane, usedLanes);
          if (childRoute.length > 0) {
            if(!shortestChildRouteLength) {
              shortestChildRouteLength = getRouteLength(childRoute);
            }
            if (getRouteLength(childRoute) <= shortestChildRouteLength) {
              currentRoute = childRoute;
              currentRoute.push(lane);
              shortestChildRouteLength = getRouteLength(childRoute);
            }
          }
        });
        return currentRoute;
      }
    }
    this.route = addLaneToRoute(this.lane, []).reverse();
  }

  update() {

    if(this.lanePos < this.lane.length) {
      this.move();
    } else if (this.lane.nextLanes.length > 0){
      // select next lane randomly or go by navigation
      if(this.useNavigation) {
        this.setLane(this.route[this.currentRouteIndex+1], 0);
      } else {
        this.setLane(this.lane.nextLanes[
          Math.floor(Math.random()*this.lane.nextLanes.length)
        ], 0);
      }
    } else {
      this.lanePos = this.lane.length;
      this.stop();
    }

    // check for actors
    // this.lane.actors.forEach(actor => {
    //   if (actor.lanePos === this.lanePos) {
    //     actor.actor.run(this);
    //   };
    // });
    
    if(!this.idle){
      this.lookAhead(); // <-- currently only looks for cars
    }

    this.checkForCollision();
    
  }

  checkForCollision() {
    const currentLane = this.lane as JunctionLane;
    let currentCars = this.lane.cars;
    if (currentLane.crossingLanes) {
      currentLane.crossingLanes.forEach(lane => {
        currentCars = currentCars.concat(lane.cars);
      });
    }
    if (currentLane.nextLanes) {
      currentLane.nextLanes.forEach(lane => {
        currentCars = currentCars.concat(lane.cars);
      });
    }
    currentCars.forEach(car => {
      if (car.id !== this.id &&
          Utils.getCenterDistance(car.element, this.element) <= 14
      ) {

        // DEVELOPMENT CRASH HANDLING

        if (!this.crashed) {
          this.crashed = true;
          console.log('Crash: Cars ', car.id, ' & ', this.id, ' @ ', currentLane.constructor.name, '', currentLane.id);
          /// Raise total crashes by 0.5
          this.engine.stats.crashes += 0.5;
          // indicator2 = `CrashRate (per car): ${crashes/(carIdCounter+1)}`

        } else if (this.crashed && Utils.getCenterDistance(car.element, this.element) > 20) {
          this.crashed = false;
        }

        ///

      }
    })
  }

  move() {
    this.lanePos += 1*this.speed;
    const point = this.lane.element.getPointAtLength(this.lanePos);

    this.element.transform(`t${point.x}, ${point.y}`);

  }

  stop() {
    this.speed = 0;
  }

  accelerate() {
    this.element.attr({fill: '#0000ff'});
    this.speed = this.speed < this.maxSpeed ?
      this.speed + 0.01 : 
      this.maxSpeed;
  }

  deccelerate() {
    this.element.attr({fill: '#ff0000'});
    this.speed = this.speed > 0 ?
      this.speed - 0.04 : 0;
  }

  leaveLane() {
    if(this.lane) {
      this.lane.cars = this.lane.cars.filter(car => car.id !== this.id);
    }
  }

  setLane(lane, pos) {
    this.leaveLane();
    this.lane = lane;
    this.lanePos = pos;
    lane.cars.push(this);
  }

  lookAhead() {
    let range = 40*this.speed + 17;

    // look ahead on planned route
    const findCarOnRoute = (pos, lane, range, index) => {
      let carInNextLane = false;
      const remainingLane = lane.length - pos;
      if(remainingLane < range && this.route[index+1]) {
        carInNextLane = findCarOnRoute(0, this.route[index+1], range-remainingLane, index+1);
      }
      let carInThisLane = lane.cars.some(car => {
        if (car.id === this.id) {
          return false;
        }
        return car.lanePos >= pos &&
               car.lanePos < pos+range;
      });
      return carInThisLane || carInNextLane;
    }
    this.carAhead = findCarOnRoute(this.lanePos, this.lane, range, this.currentRouteIndex);

    // look ahead on crossing junction lanes
    let junctionLane;
    if (this.lane.length - this.lanePos < range &&
        this.route[this.currentRouteIndex+1] &&
        this.route[this.currentRouteIndex+1].tags.includes('JUNCTION')
    ) {
      junctionLane = this.route[this.currentRouteIndex+1];
    // } else if (this.route[this.currentRouteIndex].tags.includes('JUNCTION')) {
    //   junctionLane = this.route[this.currentRouteIndex];
    }
    if (junctionLane && junctionLane.crossingLanes.some(lane => lane.cars.length > 0)) {
      this.carAhead = true;
    }
    //

  }

  lookForYield() {
    let range = 50; // distance to look on other lanes if there are cars to yield to.

    const findCarInRange = () => {

    }

  }
  
}