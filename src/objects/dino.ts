
import * as BABYLON from 'babylonjs';
import { GameObject } from "./gameObject";

export class Dino extends GameObject {
  constructor(
    name: string, 
    private _scene: BABYLON.Scene,
    ) {
    super(
      name,
      "A diplodocus dinosaur",
      "https://res.cloudinary.com/dk-find-out/image/upload/q_80,h_1000,f_auto/diplodocus_whole_amzt6e.png"
    );

    BABYLON.SceneLoader.ImportMesh("", "/models/", "NOVELO_DIPLODOCUS.obj", this._scene, (meshes, particleSystems, skeletons) => {
      console.log('dino loaded')
      if (meshes.length > 0) {
        for (var i = 0; i < meshes.length; i++) {
          meshes[i].scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
        }
        meshes[0].position = new BABYLON.Vector3(20, 20, -50);
        meshes[1].position = new BABYLON.Vector3(20, 20, -50);
        meshes[2].position = new BABYLON.Vector3(20, 20, -50);
        this.meshes = meshes;
        // var dino = meshes[0];
        // dino.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        // dino.position = new BABYLON.Vector3(50, 0, -20);
      }

      // do something with the meshes and skeletons
      // particleSystems are always null for glTF assets
    });
  }
}