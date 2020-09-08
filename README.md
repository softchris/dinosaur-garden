## Introduction

This is a demo showcasing how you can build a simulation with Babylon.js. The demo contains a garden with a dinosaur. You can move things around, create new objects and even change the objects size. Additionally you can also get information on the objects.

## Run

Ensure you have installed all dependencies with the command:

```bash
npm install
```

To run I recommend building and running like so:

```bash
npm run build && npm start
```

## Commands

It should render a scene with trees and a Dinosaur.

There are two modes:

- **Camera attached**, in this mode the only thing you can do is navigate the camera around using the mouse, so up/down/left/side
- **Camera detached**, in this mode you are able to interact with the simulation. Most commands below assume the camera is *detached*.

### Available commands

> Currently the commands are written out in developer tools via `console.log()` statements. It's recommended to have the browser developer tools open when working with and testing out the simulation.

- `C`, pressing this key toggles the Camera, when the camera is *detached* you are able to do things like dragging objects, move them with arrow keys, create new trees, get information modal
- `N`, this creates a new tree at the cursor position
- `A`, this increases the size of a selected object
- `Z`, this decreases the size of a selected object
- `Arrow keys`, this moves a selected object around IF the camera is detached.
- `Enter`, this brings up an information modal if you have an object selected.
- `Escape`, this closes the information modal.
- `Mouse click`, clicking an object selects it.
- `Mouse drag`, mouse drag an object moves it in the X and Z axis.

![Demo of the simulation](dino-garden.gif)
