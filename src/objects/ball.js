"use strict";
exports.__esModule = true;
var Ball = /** @class */ (function () {
    function Ball(scene) {
        this.scene = scene;
    }
    Ball.prototype.create = function () {
        var sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', { segments: 16, diameter: 2 }, this.scene);
        // Move the sphere upward 1/2 of its height.
        sphere.position.y = 1;
    };
    return Ball;
}());
exports.Ball = Ball;
