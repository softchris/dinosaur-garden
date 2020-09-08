import { Ball } from "./objects/ball";
import { getDistance, isColliding } from "./services/util";
import { createAnnouncement } from "./announcement-mock";
import { Box } from "./objects/box";
import { Game } from "./game";
import * as BABYLON from 'babylonjs';

export class GameLogic {
  constructor(
    private _target: BABYLON.Mesh,
    private _game: Game,
    private _boxes: Box[]
  ) { }

  checkGoalReached() {
    if (this.goalReached()) {
      this.winGame();
    }
  }

  goalReached(): boolean {
    return getDistance(this._target.position, this._game.ball.position) < 1;
  }

  handleCollision() {
    if (isColliding(this._boxes, this._game.ball)) {
      console.log('you died');
      this._game.killBall();

      createAnnouncement('that hurt', () => {
        console.log('respawned');
        this._game.respawnBall();
      });
    }
  }

  private winGame() {
    createAnnouncement('You have won', () => {
      this._game.killBall();
      console.log('respawned');
      this._game.respawnBall();

      // clean up this level
      // TODO load next level..
    }, 'green');
  }
}