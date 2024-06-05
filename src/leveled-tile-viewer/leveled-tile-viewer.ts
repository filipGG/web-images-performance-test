import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Loader } from '../loader';
import { Level } from './level';
import { getLeveledImageDefÅngström } from './leveled-tile-json-loader';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

export class LeveledTileViewer {
  private readonly _renderer = new THREE.WebGLRenderer({ antialias: true });
  private readonly _scene = new THREE.Scene();
  private readonly _camera = new THREE.PerspectiveCamera();
  private readonly _controls: OrbitControls;

  private readonly _loader = new Loader();
  private readonly _intervalHandle?: any;

  private readonly _levels: Level[] = [];
  private _currentActiveLevel?: Level;

  private _shouldRerender = true;

  constructor() {
    this._scene.background = new THREE.Color(0xffffff);

    this.configureRenderer();
    this.configureCamera();

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableRotate = false;

    this._controls.addEventListener('change', () => {
      this._shouldRerender = true;
    });

    this._loader.onLoad = () => {
      this._shouldRerender = true;
    };

    this.createTiles();
    this.initGui();

    this._intervalHandle = setInterval(() => {
      this._controls.update();

      if (this._shouldRerender) {
        this.updateZoomLevel();
        this._renderer.render(this._scene, this._camera);
        this._shouldRerender = false;
      }
    }, 16);
  }

  private addDummy(x: number, y: number) {
    const geo = new THREE.CircleGeometry(50);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = x;
    mesh.position.y = y;
    this._scene.add(mesh);
  }

  private async createTiles() {
    this.addDummy(0, 0);
    this.addDummy(0, 4254);

    const imageDef = getLeveledImageDefÅngström();

    const step = 2560;
    imageDef.Levels.forEach((levelDef, index) => {
      const min = index * step;
      const max = (index + 1) * step;
      const level = new Level(levelDef, this._loader, this._camera, min, max);
      level.visible = false;
      this._scene.add(level);
      this._levels.push(level);
    });

    this._levels[this._levels.length - 1].maxZ = 1_000_000;
  }

  private initGui() {
    const panel = new GUI();

    const obj: any = {};

    this._levels.forEach((level, index) => {
      const maxZ = `level${index}-maxZ`;

      obj[maxZ] = level.maxZ;

      panel.add(obj, maxZ, 0, 30000).onChange((maxZ) => {
        const nextLevel = this._levels[index + 1];
        level.maxZ = maxZ;

        if (nextLevel) {
          nextLevel.minZ = maxZ;
        }

        this._shouldRerender = true;
      });
    });
  }

  private async updateZoomLevel() {
    const active = this.getActiveLevel();
    active?.show();

    if (active == this._currentActiveLevel) {
      return;
    }

    this._currentActiveLevel?.hide();
    this._currentActiveLevel = active;
  }

  private getActiveLevel() {
    const z = this._camera.position.z;

    return this._levels.find((level) => {
      if (z > level.minZ && z <= level.maxZ) {
        return true;
      }
      return false;
    });
  }

  private configureRenderer() {
    const { innerWidth, innerHeight } = window;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(innerWidth, innerHeight);
    const parent = document.getElementById('app');

    if (!parent) {
      throw new Error('Parent not found');
    }

    parent.appendChild(this._renderer.domElement);
  }

  private configureCamera() {
    this._camera.fov = 60;

    const { innerWidth, innerHeight } = window;
    this._camera.aspect = innerWidth / innerHeight;
    this._camera.near = 0.1;
    this._camera.far = 1_000_000;

    this._camera.position.z = 20000;

    this._camera.updateProjectionMatrix();

    this._scene.add(this._camera);
  }
}
