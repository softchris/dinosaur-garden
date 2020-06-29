export class Box {
  private _top: BABYLON.Mesh;
  private _meshes = new Array<{ alive: boolean, mesh: BABYLON.Mesh }>();
  
  private createTop(x, z, material) {
    const top = BABYLON.MeshBuilder.CreateBox('box', {
      size: 1, width: 5, height: 3, depth: 1
    }, this._scene)
    top.position.x = x;
    top.position.y = 0;
    top.position.z = z;
    top.material = material;

    this._meshes[0] = {
      alive: true,
      mesh: top
    };
    top.showBoundingBox = false;
  }

  private createLeft(x, z, material) {
    const left = BABYLON.MeshBuilder.CreateBox('box', {
      size: 1, width: 1, height: 3, depth: 4
    }, this._scene)
    left.position.x = x - 2;
    left.position.y = 0;
    left.position.z = z - 2.5
    left.material = material;
    left.showBoundingBox = false;
    this._meshes[1] = {
      alive: true,
      mesh: left
    };
  }

  private createRight(x,z, material) {
    const right = BABYLON.MeshBuilder.CreateBox('box', {
      size: 1, width: 1, height: 3, depth: 4
    }, this._scene)
    right.position.x = x + 2;
    right.position.y = 0;
    right.position.z = z - 2.5
    right.material = material;
    right.showBoundingBox = false;
    this._meshes[2] = {
      alive: true,
      mesh: right
    };
  }

  private createBottom(x,z, material) {
    const bottom = BABYLON.MeshBuilder.CreateBox('box', {
      size: 1, width: 5, height: 3, depth: 1
    }, this._scene)
    bottom.position.x = x;
    bottom.position.y = 0;
    bottom.position.z = z - 5
    bottom.material = material;
    bottom.showBoundingBox = false;
    this._meshes[3] = {
      alive: true,
      mesh: bottom
    };
  }

  constructor(
    private _scene: BABYLON.Scene, 
    x: number, 
    z: number, 
    material: BABYLON.StandardMaterial,
    gates?: { top: boolean, left: boolean, right: boolean, bottom: boolean }
  ) {
   // x,y = 0

    // left
    /* 
    a  a   a  a
    b         c
    b         c
    b         c 
    b         c
    d  d   d  d 
    */
    if(gates) {
      if(gates.top) {
        this.createTop(x, z, material);
      }
      if(gates.left) {
        this.createLeft(x,z,material);
      }
      if (gates.right) {
        this.createRight(x, z, material);
      }
      if (gates.bottom) {
        this.createBottom(x, z, material);
      }
    } else {
      this.createTop(x,z, material);
      this.createLeft(x, z, material);
      this.createRight(x, z, material);
      this.createBottom(x, z, material);
    }

    
    

  }

  toggleBoundingBox() {
    const meshes = this.meshesToList();
    let oldVal = meshes[0].mesh.showBoundingBox;

    meshes.forEach(m => {

      m.mesh.showBoundingBox = !oldVal;
    });
    console.log(!oldVal ? "showing bounding boxes" : "hiding bounding boxes");
  }

  getBoundingBoxValue() {
    return this._top.showBoundingBox;
  }

  intersects(mesh:BABYLON.Mesh):boolean {
    // get alive meshes
    const meshList = this.meshesToList();
    const aliveMeshes = meshList.filter(m => m.alive);
    return aliveMeshes.some(m => mesh.intersectsMesh(m.mesh));
  }

  private meshesToList(): Array<{ alive: true, mesh: BABYLON.Mesh }> {
    const keys = Object.keys(this._meshes);
    let arr = [];
    for (var i = 0; i < keys.length; i++) {
      arr.push(this._meshes[keys[i]]);
    }
    return arr;
  }

  private choiceToString(choice) {
    switch(choice) {
      case 0:
        return 'top';
      case 1:
        return 'left'
      case 2:
        return 'right'
      case 3:
        return 'bottom'
      default:
        return 'unknown'
    }
  }

  openGate() {
    let choice;
    let aliveMeshes = this.meshesToList().filter(m => m.alive);
    do {
      choice = Math.floor(4 * Math.random());
    } while(!this._meshes[choice].alive && aliveMeshes.length > 0); 

    // this is if we opened everything... 
    if (!this._meshes[choice].alive) {
      console.log(`mesh ${this.choiceToString(choice)} already removed`);
    }
    
    this._scene.removeMesh(this._meshes[choice].mesh);
    this._meshes[choice].alive = false;
    if(choice > 3) {
      console.log(`we can't remove a gate: `, choice);
    }

    Box.openedGates.push(this.choiceToString(choice))
  }

  static openedGates = [];
}