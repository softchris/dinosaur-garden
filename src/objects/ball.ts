import * as BABYLON from 'babylonjs';

export class Ball {
  _sphere: BABYLON.Mesh;
  _isDead;

  constructor(private scene: BABYLON.Scene, private _light: BABYLON.IShadowLight) {
    this._sphere = BABYLON.MeshBuilder.CreateSphere('sphere1',
      { segments: 16, diameter: 2 }, this.scene);

    // Move the sphere upward 1/2 of its height.
    this._sphere.position.y = 1;
    this._sphere.position.x = -10;

    // Shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, this._light);
    shadowGenerator.addShadowCaster(this._sphere);
    shadowGenerator.useContactHardeningShadow = true;
  }

  move(key, value) {
    this._sphere.position[key] += value;
  }

  kill() {
    this.scene.removeMesh(this._sphere);
    this._isDead = true;
  }

  isDead() {
    return this._isDead;
  }

  get position() {
    return this._sphere.position;
  }
}