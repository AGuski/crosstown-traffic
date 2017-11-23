import * as Snap from 'snapsvg';
import * as _ from 'lodash';

import { Lane } from './core/lane';
import { JunctionLane } from './core/junction-lane';
import { Car } from './core/car';
import { Engine } from './core/engine';

let engine = new Engine();

const world = engine.world;

let indicator1Text = document.getElementById('indicator1');
let indicator2Text = document.getElementById('indicator2');

function doStuff(event) {
  console.log('x: ',event.offsetX, 'y: ', event.offsetY);
}

document.addEventListener('click', doStuff);

let indicator1;
let indicator2;

function debounce(callback, wait) {
  let timeout = false;
  return () => {
    console.log(timeout);
    if (!timeout) {
      callback();
      timeout = true;
      setTimeout(() => {
        timeout = false;
      }, wait);
    } 
  }
}


/**
 *  
 * Lanes -> start; end; length; cars; actors;
 * 
 * Variations of Roads have Lanes (two-lane, one-way, multi-lane);
 * Multi-lane roads allow lane switching.
 * 
 * Junctions have Lanes.
 * Junctions create lanes to connect the lanes of multipe roads automatically.
 * Junctions have an order of which lanes have priority and are "look-behind" for other cars.
 * 
 * junction lanes will get tagged 'junction' to make cars check for other traffic.
 * 
 * Each junction lane has an array of other junction lanes (from that junction) that, if occupied (or about to be?),
 * will make a car try to stop on the beginning of that junction lane.
 * 
 * IMPROVEMENT: Always yield if car is on related junction lane, but only yield if car is a bit before a "yielded to"
 * junction lane
 * 
 * - check for "yielding to car on other lane" by distance via lane position/length and relative speed
 *  (difference between both cars speed)
 * 
 *  
 * TODO:
 * 
 * - abstract routes into own Route class
 * - calculate crash rate (total crashes per car) <- helps to improve yielding rules
 * - slow down in higher angle curved (junction)lanes ( have max speed defined by curve angle)
 * 
 * - cars break to reach speed at certain point
 * 
 */

/// Lane

let laneCounter = 0;



world.lanes = [
  new Lane(laneCounter++, {x: 40, y: 20}, {x: 140, y: 100}, [{x: 110, y: 55}]),
  new Lane(laneCounter++, {x: 140, y: 130}, {x: 40, y: 180}),
  new Lane(laneCounter++, {x: 180, y: 120}, {x: 280, y: 120}),
  new Lane(laneCounter++, {x: 163, y: 140}, {x: 213, y: 230}),
  new Lane(laneCounter++, {x: 300, y: 140}, {x: 250, y: 245}, [{x: 300, y: 200}]),
  new Lane(laneCounter++, {x: 210, y: 255}, {x: 60, y: 255}),

  new Lane(laneCounter++, {x: 370, y: 20}, {x: 305, y: 100 }),
  new Lane(laneCounter++, {x: 315, y: 108}, {x: 380, y: 28 }),

  new Lane(laneCounter++, {x: 225, y: 230}, {x: 175, y: 140}),

  new Lane(laneCounter++, {x: 145, y: 90}, {x: 48, y: 10}, [{x: 118, y: 45}]), 
];
// 10
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[0], world.lanes[1]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[0], world.lanes[3]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[0], world.lanes[2]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[3], world.lanes[5]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[2], world.lanes[4]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[4], world.lanes[5]))

world.lanes.push(new JunctionLane(laneCounter++, world.lanes[6], world.lanes[4]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[2], world.lanes[7]))

world.lanes.push(new JunctionLane(laneCounter++, world.lanes[4], world.lanes[8]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[8], world.lanes[2]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[8], world.lanes[1]))

world.lanes.push(new JunctionLane(laneCounter++, world.lanes[8], world.lanes[9]))


// new world.lanes 
//22
world.lanes.push(new Lane(laneCounter++, {x: 375, y: 275}, {x: 250, y: 265}, [{x: 355, y: 280}, {x: 285, y: 300}]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[22], world.lanes[8]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[22], world.lanes[5]))

world.lanes.push(new Lane(laneCounter++, {x: 242, y: 273}, {x: 378, y: 290}, [{x: 280, y: 315}, {x: 355, y: 295} ]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[3], world.lanes[25]))
world.lanes.push(new JunctionLane(laneCounter++, world.lanes[4], world.lanes[25]))


// yieldToLanesTest

world.getLaneById(13).yieldToLane(world.getLaneById(15))
world.getLaneById(17).yieldToLane(world.getLaneById(16))
world.getLaneById(17).yieldToLane(world.getLaneById(14))
world.getLaneById(12).yieldToLane(world.getLaneById(19))

world.getLaneById(20).yieldToLane(world.getLaneById(10))
world.getLaneById(20).yieldToLane(world.getLaneById(11))
world.getLaneById(12).yieldToLane(world.getLaneById(21))
world.getLaneById(14).yieldToLane(world.getLaneById(16))

world.getLaneById(23).yieldToLane(world.getLaneById(18))
world.getLaneById(23).yieldToLane(world.getLaneById(15))
world.getLaneById(23).yieldToLane(world.getLaneById(27))

world.getLaneById(24).yieldToLane(world.getLaneById(26))
world.getLaneById(24).yieldToLane(world.getLaneById(13))
world.getLaneById(24).yieldToLane(world.getLaneById(27))

world.getLaneById(15).yieldToLane(world.getLaneById(26))


// ROADS


// class Road {
//   laneB: Lane;
//   laneA: Lane;
//   constructor(pointA, pointB, controlPoints) {
//     this.laneA = new Lane(pointA, pointB, controlPoints ? controlPoints : null);
//     this.laneB = new Lane(pointB, pointA, controlPoints ? [controlPoints[1], controlPoints[0]] : null);
//   }
// }


// let road = new Road({x: 20, y: 50}, {x: 170, y: 100});

// CARS

// let movingCar = new Car(1, lanes[0], 0);

// cars.push(movingCar);

// let idleCar = new Car(10000, lanes[14], 20);
// idleCar.idle = true;

// cars.push(idleCar);


let carIdCounter = 0;

class CarEntry {
  constructor(lane, interval) {
    setInterval(() => {
      world.cars.push(new Car(carIdCounter++, lane, 0));
      indicator1 = `Total cars: ${carIdCounter}`;
    }, interval)
  }
}

class CarExit {
  constructor(private lane) {
  }

  run() {
    this.lane.cars.forEach(car => {
      if (car.lanePos >= this.lane.length) {
        car.element.remove();
        car.leaveLane();
        world.cars = world.cars.filter(currentCar => currentCar.id !== car.id);
      }
    });
  }
}

new CarEntry(world.lanes[0], 1500);
new CarEntry(world.lanes[6], 2500);
new CarEntry(world.lanes[22], 3000);

let exit1 = new CarExit(world.lanes[1]);
let exit2 = new CarExit(world.lanes[5]);
let exit3 = new CarExit(world.lanes[7]);
let exit4 = new CarExit(world.lanes[9]);
let exit5 = new CarExit(world.lanes[25]);


//

console.log(world.lanes);

function render() {

  if (world.cars.length > 0) {
    world.cars.forEach(car => {
      // renderCar
      car.element.attr({
        cx: car.lane.element.getPointAtLength(car.lanePos).x,
        cy: car.lane.element.getPointAtLength(car.lanePos).y
      });

      // move Car
      if (!car.idle && !car.carAhead) {
        car.accelerate();
      }
      if (!car.idle && car.carAhead) {
        car.deccelerate();
      }
      car.update();
    });

    exit1.run();
    exit2.run();
    exit3.run();
    exit4.run();
    exit5.run();
    
    indicator1Text.innerHTML = indicator1;
    indicator2Text.innerHTML = `CrashRate (per car): ${engine.stats.crashes/(carIdCounter+1)}`;
  }
  window.requestAnimationFrame(render);
}
render();



