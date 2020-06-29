export class Tree {
  _meshes:BABYLON.AbstractMesh[];
  constructor(
    private name: string, 
    private _scene: BABYLON.Scene, 
    private _light: BABYLON.IShadowLight,
    scaling: number,
    position: BABYLON.Vector3
  ) {
    // set up over and out effects
    var makeOverOut = function (mesh: BABYLON.AbstractMesh) {
      // var oldVal = mesh.scaling; 
      mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        mesh,
        'visibility',
        0.5,
        150
      ))

      mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        mesh,
        'visibility',
        1.0,
        150
      ))

      // mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", mesh.material.emissiveColor));
      // mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", BABYLON.Color3.White()));
      // mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, "scaling", new BABYLON.Vector3(oldVal.x, oldVal.y, oldVal.z), 150));
      // mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, "scaling", new BABYLON.Vector3(oldVal.x * 1.1, oldVal.y * 1.1, oldVal.z * 1.1), 150));
    }

    var shadowGenerator = new BABYLON.ShadowGenerator(1024, this._light);
    BABYLON.SceneLoader.ImportMesh("", "/models/", "BubingaTree.obj", this._scene, (meshes, particleSystems, skeletons) => {
      console.log('tree loaded')
      this._meshes = meshes;

      for (var i = 0; i < meshes.length; i++) {

        // scale and position
        meshes[i].scaling = new BABYLON.Vector3(scaling, scaling, scaling);
        meshes[i].position =  position;
        
        // set up shadow
        shadowGenerator.addShadowCaster(this._meshes[i]);
        shadowGenerator.useContactHardeningShadow = true;

        // set up hover in/out action
        meshes[i].actionManager = new BABYLON.ActionManager(this._scene)

        makeOverOut(meshes[i]);
      }      
    })

    
  }
}