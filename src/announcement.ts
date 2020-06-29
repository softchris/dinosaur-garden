import { Button, TextBlock, AdvancedDynamicTexture } from 'babylonjs-gui';
var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

export const createAnnouncement = (message, cb, color = 'red') => {
  var text1 = new TextBlock('txt', message);
  text1.fontWeight = '600';
  text1.color = color;
  text1.fontSize = 40;

  setTimeout(() => {
    advancedTexture.removeControl(text1);
    cb();
  }, 2000);

  advancedTexture.addControl(text1);
}


  // Example button
  // var button = Button.CreateSimpleButton("but", "Click Me");
  // button.width = 0.4;
  // button.height = "40px";
  // button.width = "100px";
  // button.color = "white";
  // button.background = "green";




  // advancedTexture.addControl(button); 