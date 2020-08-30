import { Box } from "../objects/box";
import { Ball } from "../objects/ball";

export const createGoalMesh = (target, scene: BABYLON.Scene) => {
  var cone = BABYLON.MeshBuilder.CreateCylinder("cone", { diameterTop: 0, height: 1, tessellation: 96 }, scene);
  cone.position.x = 5 * target.x;
  cone.position.z = 6 * target.y - 2;
  cone.position.y = 1.5;
  return cone;
}

export const getDistance = (pos: BABYLON.Vector3, pos2: BABYLON.Vector3) => BABYLON.Vector3.Distance(pos, pos2);

export const isColliding = (boxes: Box[], ball: Ball) => {
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].intersects(ball._sphere)) {
      console.log('ball intersect');
      return true
    }
  }
  return false;
}