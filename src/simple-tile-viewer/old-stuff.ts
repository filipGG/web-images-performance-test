/*

  public dispose() {
    clearInterval(this._intervalHandle);
    this.diposeAllTexturesInScene();
    this._controls.dispose();
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
  */

/*
  private async loadWithChunks() {
    const imageDef = getImageDef256();
    const chunks = this.chunkTiles(imageDef.Tiles);

    for (let i = 0; i < chunks.length; i++) {
      const currentChunk = chunks[i];
      await this.loadChunk(currentChunk);
    }
  }

  private async loadChunk(tiles: ImageDefTile[]) {
    const promises = tiles.map((tile) => {
      if (!tile.dataUrl) {
        return Promise.resolve();
        //return this.addWithoutTexture(tile);
      } else {
        return this.addWithTexture(tile);
      }
    });

    await Promise.all(promises);
  }

  private chunkTiles(tiles: ImageDefTile[]) {
    const chunks: ImageDefTile[][] = [];
    const chunkSize = 100;

    for (let i = 0; i < tiles.length; i += chunkSize) {
      const chunk = tiles.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    return chunks;
  }
  
  private async addWithoutTexture(tile: ImageDefTile) {
    const geo = new THREE.PlaneGeometry(tile.Width, tile.Height);
    const mat = new THREE.MeshBasicMaterial({ transparent: true, color: 0xff0000 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = tile.X;
    mesh.position.y = tile.Y;
    this._scene.add(mesh);
  }
  */
