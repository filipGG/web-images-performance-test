import * as THREE from 'three';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { Ktx2Mesh } from './ktx2-mesh';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class FullsizeViewer {
  private readonly _renderer = new THREE.WebGLRenderer();
  private readonly _scene = new THREE.Scene();
  private readonly _camera = new THREE.PerspectiveCamera();
  private readonly _controls: OrbitControls;

  private readonly _imageBitmapLoader = new THREE.ImageBitmapLoader();
  private readonly _ktx2Loader = new KTX2Loader()
    .setTranscoderPath('/web-images-performance-test/')
    .detectSupport(this._renderer);

  private readonly _intervalHandle?: any;

  constructor() {
    this._scene.background = new THREE.Color(0xffffff);
    this._imageBitmapLoader.setOptions({ imageOrientation: 'flipY' });
    this.configureRenderer();
    this.configureCamera();

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableRotate = false;

    for (let i = 1; i <= 5; i++) {
      const mesh = new Ktx2Mesh(`Ångström1-resized-ktx/Ångström1-resized-${i}.ktx2`, this._ktx2Loader);
      mesh.position.x += Math.random() * 2000 - 1000;
      mesh.position.y += Math.random() * 2000 - 1000;
      this._scene.add(mesh);
    }

    /*
    for (let i = 1; i <= 10; i++) {
      const mesh = new Ktx2Mesh(`Ångström1-resized-ktx-etc1/Ångström1-resized-etc1-${i}.ktx2`, this._ktx2Loader);
      mesh.position.x += Math.random() * 2000 - 1000;
      mesh.position.y += Math.random() * 2000 - 1000;
      this._scene.add(mesh);
    }
    */

    /*
    for (let i = 1; i <= 10; i++) {
      const mesh = new PngMesh(`Ångström1-resized-png/Ångström1-resized-${i}.png`, this._imageBitmapLoader);
      mesh.position.x += Math.random() * 2000 - 1000;
      mesh.position.y += Math.random() * 2000 - 1000;
      this._scene.add(mesh);
    }
    */

    //this._ktx2Mesh = new Ktx2Mesh('Ångström1-resized.ktx2', this._ktx2Loader);
    //this._ktx2Mesh = new Ktx2Mesh('kvarsiten-resized.ktx2', this._ktx2Loader);
    //this._scene.add(this._ktx2Mesh);

    //this._pngMesh = new PngMesh('Ångström1-resized.png', this._imageBitmapLoader);
    //this._pngMesh = new PngMesh('kvarsiten-resized.png', this._imageBitmapLoader);
    //this._scene.add(this._pngMesh);

    this._intervalHandle = setInterval(() => {
      this._controls.update();
      this._renderer.render(this._scene, this._camera);
    }, 16);
  }

  public dispose() {
    clearInterval(this._intervalHandle);
    this.diposeAllTexturesInScene();
    this._controls.dispose();
    this._ktx2Loader.dispose();
    this._renderer.dispose();
    this._renderer.domElement.parentElement?.removeChild(this._renderer.domElement);
  }

  private diposeAllTexturesInScene() {
    const disposables: any[] = [];

    this._scene.traverse((child: any) => {
      if (child.material) {
        disposables.push(child);
      }
    });

    disposables.forEach((child) => {
      child.parent.remove(child);
      child.material.dispose();
      if (child.material.map) {
        child.material.map.dispose();
      }
    });

    this._scene.clear();
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
    this._camera.position.set(0, 0, 2000);

    this._camera.updateProjectionMatrix();

    this._scene.add(this._camera);
  }
}
