import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { SimpleTileViewer } from './simple-tile-viewer/simple-tile-viewer';
import { LeveledTileViewer } from './leveled-tile-viewer/leveled-tile-viewer';

export class App {
  private _currentViewer = new LeveledTileViewer();

  constructor() {
    console.log('hello: ', this._currentViewer);
  }
}
