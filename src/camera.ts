import * as BABYLON from 'babylonjs';

export class Camera {
  private _camera: BABYLON.FreeCamera;
  private _isCamera = false;
  constructor(private _scene: BABYLON.Scene, private _canvas) {
    this._camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 100, -155), this._scene);
    this._camera.setTarget(new BABYLON.Vector3(10, 0, 10));
  }

  get isCamera(): boolean {
    return this._isCamera
  }

  get camera() {
    return this._camera;
  }

  toggleCameraControl() {
    if (!this.isCamera) {
      this._camera.attachControl(this._canvas, false);
      this._isCamera = true;
      console.log('attaching camera');
    } else {
      this._camera.detachControl(this._canvas);
      this._isCamera = false;
      console.log('detaching camera');
    }
  }
}