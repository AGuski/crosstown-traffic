import { World } from './world';
import * as Snap from 'snapsvg';

export class Engine {

  static instance: Engine;

  private svgCanvas: Snap.Paper;
  private laneElementGroup: Snap.Paper;
  private carElementGroup: Snap.Paper;

  world = new World(this);


  public stats = {
    crashes: 0
  }


  constructor() {
    if (Engine.instance) {
      return Engine.instance;
    }

    Engine.instance = this;

    this.svgCanvas = Snap('#svg');

    this.laneElementGroup = this.svg.group();
    this.carElementGroup = this.svg.group();

  }

  get svg() { return this.svgCanvas; }

  add(pathString, group?) {
    let path = this.svg.path(pathString);
    if (group) {
      this[group].add(path);
    }
    return path;
  }
}
