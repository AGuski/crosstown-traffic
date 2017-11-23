import { Engine } from './engine';
import { JunctionLane } from './junction-lane';
import { Lane } from './lane';
import { Car } from './car';

import * as Snap from 'snapsvg';

export class World {

  public cars: Car[] = [];
  public lanes: Lane[] = [];

  public stats = {
    crashes: 0
  }

  constructor(private engine: Engine) { }

  // add(obj: Car | Lane | JunctionLane) {
  //   switch(typeof obj ) {
  //     case 'Car':
  //       this.addCar(obj);
  //       break;
  //   }
  // }

  getLaneById(id): JunctionLane {
    return <JunctionLane>this.lanes.find(lane => lane.id === id);
  }


}