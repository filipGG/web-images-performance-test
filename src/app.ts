import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { FullsizeViewer } from './fullsize-viewer/fullsize-viewer';
import { SimpleTileViewer } from './simple-tile-viewer/simple-tile-viewer';
import { Viewer } from './viewer';

export class App {
  private _currentViewer?: Viewer;

  constructor() {
    const panel = new GUI();

    const settings = {
      none: () => {
        this._currentViewer?.dispose();
        this._currentViewer = undefined;
      },
      fullsize: () => {
        this._currentViewer?.dispose();
        this._currentViewer = undefined;
        this._currentViewer = new FullsizeViewer();
      },
      simpleTileViewer: () => {
        this._currentViewer?.dispose();
        this._currentViewer = undefined;
        this._currentViewer = new SimpleTileViewer();
      },
    };

    panel.add(settings, 'none');
    panel.add(settings, 'fullsize');
    panel.add(settings, 'simpleTileViewer');

    settings.simpleTileViewer();
  }
}
