import * as BABYLON from 'babylonjs';
import "babylonjs-loaders";
import * as GUI from 'babylonjs-gui';

import { Ball } from "./objects/ball";
import { Box } from './objects/box';

import {level } from './levels/level1';
import { createGoalMesh } from './services/util'
import { GameLogic } from "./gameLogic";
import { Camera } from "./camera";
import { Tree } from "./objects/tree";
import { Dino } from './objects/dino';
import { GameObject } from "./objects/gameObject";

enum Keys {
  ArrowRight = 'ArrowRight',
  ArrowLeft = 'ArrowLeft',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  New = 'n',
  Increase = 'a',
  Decrease = 'z',
  ShowUI = 'Enter',
  HideUI = 'Escape'
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
        this._game.toggleBoundingBoxes();
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

      if(evt.sourceEvent.key === Keys.ShowUI) {
        this._game.loadUIInfo();
        this._game.toggleUI(true);
      }
      if (evt.sourceEvent.key === Keys.HideUI) {
        this._game.toggleUI(false);
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
    this._game.selectedObject.scale(0.8);
  }
  private increaseObject() {
    if (this._game.selectedObject) {
      this._game.selectedObject.scale(1.2);
    }
  }

  private handleKey(positionKey, change) {
    // TODO do this to GameObject instead
    // we should find the gameObject, and us move method, that moves all meshes, not just one.
    if (this._game.selectedObject) {
      this._game.selectedObject.move(positionKey, change); 
    }
    // this._game.currentObject.position[positionKey] += change;
  }

  private createTree() {
    const pos = this.getGroundPosition();
    pos.y += 5;
    const tree = new Tree(`tree ${this._game._gameObjects.length}`, this._scene, this._game.light, 15, pos, "A tree");
    this._game._gameObjects.push(tree);
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
  _selectedObject: GameObject | null;
  private _highlight: BABYLON.HighlightLayer;

  constructor(
    private _scene: BABYLON.Scene, 
    private _ground:BABYLON.Mesh,
    private _camera:Camera,
    private _canvas: HTMLCanvasElement,
    private _game: Game
  ) {
    this._canvas.addEventListener("pointerdown", this.onPointerDown.bind(this), false);
    this._canvas.addEventListener("pointerup", this.onPointerUp.bind(this), false);
    this._canvas.addEventListener("pointermove", this.onPointerMove.bind(this), false);

    this._highlight = new BABYLON.HighlightLayer("hl1", this._scene);

  }

  setSelectedObject(mesh: BABYLON.Mesh) {
    this.currentMesh = mesh;
    if(mesh === null) {
      this._selectedObject = null;
      return;
    }

    for (let index = 0; index < this._game._gameObjects.length; index++) {
      const gameObject = this._game._gameObjects[index];
      if (gameObject.isMeshInObject(this.currentMesh)) {
        this._selectedObject = gameObject;
      }
    }
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

    // only do this when camera is detached
    if (this._camera.isCamera) {
      return;
    }
      // check if we are under a mesh
      var pickInfo = this._scene.pick(
        this._scene.pointerX,
        this._scene.pointerY,
        (mesh) => {
          return mesh !== this._ground;
        }
      );
    if (pickInfo.hit) {
        if(this.currentMesh) {
          this.removeHighlight(this.currentMesh)
          // deselect
          if(this.currentMesh == pickInfo.pickedMesh) {
            this.setSelectedObject(null);
            // this.currentMesh = null;
            return;
          }
        }

        this.setSelectedObject(<BABYLON.Mesh>pickInfo.pickedMesh);
        console.log('Current object is', this._selectedObject.name);
        
        this.addHighlight(this.currentMesh);

        this.startingPoint = this.getGroundPosition();

        if (this.startingPoint) { // we need to disconnect camera from canvas
          setTimeout(() => {
              // this._camera.detachControl(this._canvas);
          }, 0);
        }
    }
  }

  onPointerUp () {
    if (this.startingPoint) {
      // this._camera.attachControl(this._canvas, true);
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

    // TODO do this to GameObject instead
    this.currentMesh.position.addInPlace(diff);

    this.startingPoint = current;
  }

  addHighlight(mesh: BABYLON.Mesh) {
    // TODO do this to GameObject instead
    this._highlight.addMesh(mesh, BABYLON.Color3.Green());
  }

  removeHighlight(mesh: BABYLON.Mesh) {
    // TODO do this to GameObject instead
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
  private _dnd: DragnDrop;
  _gameObjects: GameObject[];

  constructor(canvasElement: string) {
    // Create canvas and engine.
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    this._engine = new BABYLON.Engine(this._canvas, true);
    this._gameObjects = new Array<GameObject>();
  }

  loadUIInfo() {
    if (this._dnd._selectedObject) {
      this.label.text = this._dnd._selectedObject.description;
      this.grid.removeControl(this.image);
      this.image = new GUI.Image("image", this._dnd._selectedObject.imageUrl);
      this.image.width = "400px";
      this.grid.addControl(this.image, 1, 0);
      // this.image. = ;
      // TODO set image url too.. 
    }
  }

  get light() {
    return this._light;
  }

  get selectedObject() {
    return this._dnd._selectedObject;
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
    level.boxes.forEach((l) => {
      var materialPlane = new BABYLON.StandardMaterial(
        "texturePlane",
        this._scene
      );
      materialPlane.diffuseTexture = new BABYLON.Texture(
        "textures/wood.jpg",
        this._scene
      );
      boxes.push(
        new Box(this._scene, l.x * 5, l.y * 6, materialPlane, l.gates)
      );
    });

    this._target = createGoalMesh(level.target, this._scene);
  }

  toggleBoundingBoxes() {
    this._boxes.forEach((gameObject) => {
      gameObject.toggleBoundingBox();
    });
  }

  private grid: GUI.Grid;
  private ui: GUI.AdvancedDynamicTexture;
  private image: GUI.Image;
  private label: GUI.TextBlock;

  toggleUI(visible: boolean) {
    this.grid.isVisible = visible;
  }

  createUI(message: string) {
    // TODO switch content

    // TODO add text + image, can we center it?
    this.image = new GUI.Image("but", "textures/diplo.png");
    //image.top = "0px";
    /// image.left = "0px";
    this.image.width = "500px";
    // image.height = "100px";
    this.image.cellId = 1;
    this.image.cellHeight = 64;
    this.image.cellWidth = 64;
    //image.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    // image.stretch = GUI.Image.STRETCH_EXTEND;

    this.label = new GUI.TextBlock();
    // label.top = "101px";
    // label.width = "300px";
    this.label.text = "Here's a dino";
    this.label.color = "white";
    this.label.fontSize = 24;

    // label.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

    this.grid = new GUI.Grid();
    // grid.addColumnDefinition(300, true);
    // grid.addColumnDefinition(0.5);
    this.grid.addColumnDefinition(1.0);
    //grid.addColumnDefinition(300, true);
    this.grid.addRowDefinition(0.2);
    this.grid.addRowDefinition(0.8);

    this.grid.addControl(this.label, 0, 0);
    this.grid.addControl(this.image, 1, 0);

    this.ui.addControl(this.grid);
  }

  createScene(): void {
    // Create a basic BJS Scene object.
    this._scene = new BABYLON.Scene(this._engine);
    this._boxes = new Array<Box>();

    this.createGameFromLevel(this._boxes);
    this._camera = new Camera(this._scene, this._canvas);

    //this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this._scene);
    this._light = new BABYLON.DirectionalLight(
      "dir01",
      new BABYLON.Vector3(-1, -2, -1),
      this._scene
    );
    this._light.position = new BABYLON.Vector3(20, 40, 20);
    this._light.intensity = 0.5;

    const otherLight = new BABYLON.DirectionalLight(
      "dir02",
      new BABYLON.Vector3(-100, -2, 50),
      this._scene
    );
    otherLight.position = new BABYLON.Vector3(-80, 100, 60);
    otherLight.intensity = 0.9;

    const PLANE_SIZE = 200;

    //Creation of a plane
    this._plane = BABYLON.Mesh.CreatePlane("plane", PLANE_SIZE, this._scene);
    this._plane.position.y = -5;
    this._plane.rotation.x = Math.PI / 2;

    // var planeSize = { width: 5, height: 5 };
    // var plane = BABYLON.MeshBuilder.CreatePlane("plane1", { width: planeSize.width, height: planeSize.height }, scene);
    this.ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    // advancedTexture.background = "yellow";

    // button.background = "green";

    this.createUI("");
    this.toggleUI(false);

    //Creation of a repeated textured material
    var materialPlane = new BABYLON.StandardMaterial(
      "texturePlane",
      this._scene
    );
    materialPlane.diffuseTexture = new BABYLON.Texture(
      "textures/ground.jpg",
      this._scene
    );
    materialPlane.diffuseTexture.scale(2);
    materialPlane.backFaceCulling = false; //Always show the front and the back of an element

    this._plane.material = materialPlane;
    this._plane.receiveShadows = true;
    this._plane.position.y = 0;

    this._ball = new Ball(this._scene, this._light);

    var gameLogic = new GameLogic(this._target, this, this._boxes);

    // Keyboard events
    const gameActions = new GameActions(
      this._scene,
      this._camera,
      gameLogic,
      this._ball,
      this
    );

    this._gameObjects.push(new Dino("Dino", this._scene));

    // create trees
    for (var i = 0; i < 5; i++) {
      let randomX = -100 + Math.floor(Math.random() * PLANE_SIZE);
      let randomZ = -100 + Math.floor(Math.random() * PLANE_SIZE);
      let randomPos = new BABYLON.Vector3(randomX, 5, randomZ);

      this._gameObjects.push(
        new Tree(`tree ${i}`, this._scene, this._light, 15, randomPos, "A tree")
      );
    }

    this._dnd = new DragnDrop(
      this._scene,
      this._plane,
      this._camera,
      this._canvas,
      this
    );
  }

  doRender(): void {
    // Run the render loop.
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });

    // The canvas/window resize event handler.
    window.addEventListener("resize", () => {
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