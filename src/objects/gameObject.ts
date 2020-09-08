import * as BABYLON from 'babylonjs';

export class GameObject {
  private _meshes: BABYLON.AbstractMesh[];
  constructor(private _name: String, private _description: string, private _imageUrl: string) {}
  move(dimension: string ,d: number) {
    this.meshes.forEach(mesh => {
      mesh.position[dimension]+= d;
      // mesh.position.y = dy;
      // mesh.position.z = dz;
    });
  }

  scale(scaleFactor: number) {
    this.meshes.forEach(mesh => {
      const { x, y, z } = mesh.scaling;
      mesh.scaling = new BABYLON.Vector3(x * scaleFactor, y * scaleFactor, z * scaleFactor);
    });
  }

  isMeshInObject(value: BABYLON.AbstractMesh) {
    for(var i=0; i< this._meshes.length; i++) {
      if (this._meshes[i] === value) {
        return true;
      }
    }
    return false;
  }

  set meshes(value: BABYLON.AbstractMesh[]) {
    this._meshes = value;
  }

  get meshes() {
    return this._meshes;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get imageUrl() {
    return this._imageUrl;
  }
}