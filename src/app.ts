import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { SimpleTileViewer } from './simple-tile-viewer/simple-tile-viewer';

export class App {
  private _currentViewer = new SimpleTileViewer();

  constructor() {
    const panel = new GUI();

    const settings = {
      none: () => {},
      simpleTileViewer: () => {},
    };

    panel.add(settings, 'none');
    panel.add(settings, 'simpleTileViewer');

    settings.simpleTileViewer();
  }
}
