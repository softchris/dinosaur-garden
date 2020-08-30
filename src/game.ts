///<reference path="../babylon.d.ts" />

import { Ball } from "./objects/ball";

import { Box } from './objects/box';

import {level } from './levels/level1';
import { createGoalMesh } from './services/util'
import { GameLogic } from "./gameLogic";
import { Camera } from "./camera";
import { Tree } from "./objects/tree";
import { KeyPropertySet } from "babylonjs-gui";

// CHECK find a way to switch between game object, click to select
// CHECK drag n drop?

// CHECK DINO park, add dinos and trees
// CHECK move things around:
// CHECK decide position, size, 
// rotation

// load world from file with trees and mountains
// log out selected objects position and scale
// find a way to circle between different things to build and indicate it, console log between options?
// circle between a world builder camera and an FPS one




// better lighting
// destroy completed level: clean up new level
// load new level
// color on the target
// HUD?
// Skybox?
// move with a speed?
// monsters?

enum Keys {
  ArrowRight = 'ArrowRight',
  ArrowLeft = 'ArrowLeft',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  New = 'n',
  Increase = 'a',
  Decrease = 'z'
};

class GameActions {
  inputMap = {};

  constructor(
    private _scene: BABYLON.Scene,
    private _camera: Camera,
    private gameLogic: GameLogic,
    private _ball: Ball,
    private _game: Game
  ) {
    this._scene.actionManager = new BABYLON.ActionManager(this._scene);
    // this._scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
    //   this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    // }));

    let keyMapping = {
      [Keys.ArrowUp]: () => this.handleKey('z', 0.2),
      [Keys.ArrowLeft]: () => this.handleKey('x', -0.2),
      [Keys.ArrowDown]: () => this.handleKey('z', -0.2),
      [Keys.ArrowRight]: () => this.handleKey('x', 0.2)
    }

    this._scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
      this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      console.log('keydown');
    }));

    this._scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
      console.log('keyup');
      // if (this._camera.isCamera && evt.sourceEvent.key !== 'c') return;
      this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

      console.log('key up: ', evt.sourceEvent.key);
      if (evt.sourceEvent.key === 'c') {
        this._camera.toggleCameraControl();
      }

      if (evt.sourceEvent.key === 'b') {
        this._game.toogleBoundingBoxes();
      }

      if(evt.sourceEvent.key === Keys.New) {
        this.createTree();
      }

      if (evt.sourceEvent.key === Keys.Increase) {
        this.increaseObject();
      }

      if (evt.sourceEvent.key === Keys.Decrease) {
        this.decreaseObject();
      }
      
    }));

    

    this._scene.onBeforeRenderObservable.add((eventData) => {
      
      if(this._game.ball.isDead() || this._camera.isCamera) {
        return;
      };

      if (this.inputMap[Keys.ArrowUp]) {
        keyMapping[Keys.ArrowUp]();
      }

      if (this.inputMap[Keys.ArrowDown]) {
        keyMapping[Keys.ArrowDown]();
      }

      if (this.inputMap[Keys.ArrowLeft]) {
        keyMapping[Keys.ArrowLeft]();
      }

      if (this.inputMap[Keys.ArrowRight]) {
        keyMapping[Keys.ArrowRight]();
      }
    })
  }

  private decreaseObject() {
    const { x, y, z } = this._game.currentObject.scaling;
    // if(x - 0.4 < 0) { return; }

    this._game.currentObject.scaling = new BABYLON.Vector3(x * 0.8, y * 0.8, z * 0.8);
  }
  private increaseObject() {
    // increase with a percentage, like 20%
    if(this._game.currentObject) {
      const { x, y, z } = this._game.currentObject.scaling;
      this._game.currentObject.scaling = new BABYLON.Vector3(x * 1.2, y * 1.2, z * 1.2);
    }
  }

  // TODO move currentObject instead if camera is off
  private handleKey(positionKey, change) {
    this._game.currentObject.position[positionKey] += change;

    // this._game.ball.move(positionKey, change);
    // this._ball._sphere.position[positionKey] += change
    // this.gameLogic.handleCollision();
    // this.gameLogic.checkGoalReached()
  }

  private createTree() {
    const pos = this.getGroundPosition();
    new Tree('new tree', this._scene, this._game.light, 1, pos);
  }

  private getGroundPosition () {
    // Use a predicate to get position on the ground
    var pickinfo = this._scene.pick(
      this._scene.pointerX, 
      this._scene.pointerY, 
      (mesh) => { return true }
    );

    return pickinfo.pickedPoint;
  }
}


class DragnDrop {
  startingPoint;
  currentMesh: BABYLON.Mesh;
  private _highlight: BABYLON.HighlightLayer;

  constructor(
    private _scene: BABYLON.Scene, 
    private _ground:BABYLON.Mesh,
    private _camera:BABYLON.Camera,
    private _canvas: HTMLCanvasElement
  ) {
    this._canvas.addEventListener("pointerdown", this.onPointerDown.bind(this), false);
    this._canvas.addEventListener("pointerup", this.onPointerUp.bind(this), false);
    this._canvas.addEventListener("pointermove", this.onPointerMove.bind(this), false);

    this._highlight = new BABYLON.HighlightLayer("hl1", this._scene);

  }

  getGroundPosition () {
    // Use a predicate to get position on the ground
    var pickinfo = this._scene.pick(
      this._scene.pointerX, 
      this._scene.pointerY, 
      (mesh) => { return mesh == this._ground; }
    );

    if (pickinfo.hit) {
        return pickinfo.pickedPoint;
    }

    return null;
  }

  onPointerDown(evt) {
    if (evt.button !== 0) {
        return;
    }

    // check if we are under a mesh
    var pickInfo = this._scene.pick(
      this._scene.pointerX, 
      this._scene.pointerY, (mesh) => { return mesh !== this._ground; });
    if (pickInfo.hit) {
        if(this.currentMesh) {
          this.removeHighlight(this.currentMesh)
          // deselect
          if(this.currentMesh == pickInfo.pickedMesh) {
            this.currentMesh = null;
            return;
          }
        }

        this.currentMesh = <BABYLON.Mesh>pickInfo.pickedMesh;
        this.addHighlight(this.currentMesh);

        // highlight object
        

        this.startingPoint = this.getGroundPosition();

        if (this.startingPoint) { // we need to disconnect camera from canvas
          setTimeout(() => {
              this._camera.detachControl(this._canvas);
          }, 0);
        }
    }
  }

  onPointerUp () {
    if (this.startingPoint) {
      this._camera.attachControl(this._canvas, true);
      this.startingPoint = null;
      return;
    }
  }

  onPointerMove (evt) {
    if (!this.startingPoint) {
      return;
    }

    var current = this.getGroundPosition();

    if (!current) {
        return;
    }

    var diff = current.subtract(this.startingPoint);
    this.currentMesh.position.addInPlace(diff);

    this.startingPoint = current;
  }

  addHighlight(mesh: BABYLON.Mesh) {
    this._highlight.addMesh(mesh, BABYLON.Color3.Green());
  }

  removeHighlight(mesh: BABYLON.Mesh) {
    this._highlight.removeMesh(mesh);
  }
}

export class Game {
  private _canvas: HTMLCanvasElement;
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  private _camera: Camera;
  private _light: BABYLON.DirectionalLight;
  private _ball: Ball;
  private _target: BABYLON.Mesh;
  private _boxes: Box[];
  private _plane: BABYLON.Mesh;
  private _dnd:DragnDrop

  constructor(canvasElement: string) {
    // Create canvas and engine.
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    this._engine = new BABYLON.Engine(this._canvas, true);
  }

  get light() {
    return this._light;
  }

  get currentObject() {
    return this._dnd.currentMesh;
  }

  killBall() {
    this._ball.kill();
  }

  respawnBall() {
    this._ball = new Ball(this._scene, this._light);
  }

  get ball() {
    return this._ball;
  }

  private createGameFromLevel(boxes: Box[]) {
    level.boxes.forEach(l => {
      var materialPlane = new BABYLON.StandardMaterial("texturePlane", this._scene);
      materialPlane.diffuseTexture = new BABYLON.Texture("textures/wood.jpg", this._scene);
      boxes.push(new Box(this._scene, l.x * 5, l.y * 6, materialPlane, l.gates));
    })

    this._target = createGoalMesh(level.target, this._scene);
  }

  private createRandomGame() {
    for (var rows = 0; rows < 10; rows++) {
      for (var cols = 0; cols < 10; cols++) {
        var materialPlane = new BABYLON.StandardMaterial("texturePlane", this._scene);
        materialPlane.diffuseTexture = new BABYLON.Texture("textures/wood.jpg", this._scene);

        this._boxes.push(new Box(this._scene, rows * 5, cols * 6, materialPlane));
      }
    }

    this.openGates(300);
  }

  private openGates(noOfGates: number) {
    for (var i = 0; i < noOfGates; i++) {
      let index = Math.max(0, Math.floor(this._boxes.length * Math.random()));
      this._boxes[index].openGate();
    }
  }

  toogleBoundingBoxes() {
    this._boxes.forEach(gameObject => {
      gameObject.toggleBoundingBox();
    })
  }

  createScene(): void {
    // Create a basic BJS Scene object.
    this._scene = new BABYLON.Scene(this._engine);
    this._boxes = new Array<Box>();

    this.createGameFromLevel(this._boxes);
    this._camera = new Camera(this._scene, this._canvas);

    // Attach the camera to the canvas.
    // this._camera.attachControl(this._canvas, false);

    // Create a basic light, aiming 0,1,0 - meaning, to the sky.
    //this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this._scene);
    this._light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), this._scene);
    this._light.position = new BABYLON.Vector3(20, 40, 20);
    this._light.intensity = 0.5;

    const otherLight = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(-100, -2, 50), this._scene);
    otherLight.position = new BABYLON.Vector3(-80, 100, 60);
    otherLight.intensity = 0.9;

    

    //Creation of a plane
    // TODO smaller plane
    this._plane = BABYLON.Mesh.CreatePlane("plane", 200, this._scene);
    this._plane.position.y = -5;
    this._plane.rotation.x = Math.PI / 2;

    //Creation of a repeated textured material
    var materialPlane = new BABYLON.StandardMaterial("texturePlane", this._scene);
    materialPlane.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", this._scene);
    materialPlane.diffuseTexture.scale(2);
    materialPlane.backFaceCulling = false;//Always show the front and the back of an element

    this._plane.material = materialPlane;
    this._plane.receiveShadows = true;
    this._plane.position.y = 0;

    this._ball = new Ball(this._scene, this._light);

    var gameLogic = new GameLogic(
      this._target,
      this,
      this._boxes
    );

    // Keyboard events
    const gameActions = new GameActions(
      this._scene, 
      this._camera, 
      gameLogic, 
      this._ball, 
      this);


    // TODO don't load this  
    // BABYLON.SceneLoader.ImportMesh("", "/models/", "model.gltf", this._scene, (meshes, particleSystems, skeletons) => {
    //   console.log('island loaded');
    //   for (var i = 0; i < meshes.length; i++) {
    //     meshes[i].scaling = new BABYLON.Vector3(10, 10, 10);
    //     meshes[i].position = new BABYLON.Vector3(10, -12, -10);
    //   }
    // });

    BABYLON.SceneLoader.ImportMesh("", "/models/", "NOVELO_DIPLODOCUS.obj", this._scene, (meshes, particleSystems, skeletons) => {
      console.log('dino loaded')
      if(meshes.length > 0) {
        for(var i=0; i< meshes.length; i++) {
          meshes[i].scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
        }
        meshes[0].position = new BABYLON.Vector3(20, 20, -50);
        meshes[1].position = new BABYLON.Vector3(20, 20, -50);
        meshes[2].position = new BABYLON.Vector3(20, 20, -50);
        
        // var dino = meshes[0];
        // dino.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        // dino.position = new BABYLON.Vector3(50, 0, -20);
      }
      
      // do something with the meshes and skeletons
      // particleSystems are always null for glTF assets
    });

    for(var i=0; i< 5; i++) {
      
      let randomSize = Math.floor(Math.random() * 3) + 1;
      let randomX = -100 + Math.floor(Math.random() * 200);
      let randomZ = -100+ Math.floor(Math.random() * 200);
      let randomPos = new BABYLON.Vector3(randomX, 0, randomZ);

      new Tree(`tree ${i}`, this._scene, this._light, randomSize, randomPos);
    }

    this._dnd = new DragnDrop(
      this._scene, 
      this._plane, 
      this._camera.camera, 
      this._canvas
    );

    // BABYLON.SceneLoader.ImportMesh("","/models/", "BubingaTree.obj", this._scene, function(meshes, particleSystems, skeletons) {
    //   console.log('tree loaded')
    //   for (var i = 0; i < meshes.length; i++) {
    //     meshes[i].scaling = new BABYLON.Vector3(1, 1, 1);
    //     meshes[i].position = new BABYLON.Vector3(0, 0, 50); 
    //   }
    // })
  }

  doRender(): void {
    // Run the render loop.
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });

    // The canvas/window resize event handler.
    window.addEventListener('resize', () => {
      this._engine.resize();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Create the game using the 'renderCanvas'.
  let game = new Game('renderCanvas');

  // Create the scene.
  game.createScene();

  // Start render loop.
  game.doRender();
});