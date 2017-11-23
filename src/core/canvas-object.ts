import { Engine } from './engine';

export abstract class CanvasObject {

  protected engine = new Engine();
  element: Snap.Element;

  constructor(options?) {
    if (options.pathString) {
      this.element = this.engine.add(
        options.pathString, 
        options.group ? options.group : undefined
      );
    }
  }
}
