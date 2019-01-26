import * as PIXI from "pixi.js";
import { DialogTree as dialogTree } from "./MockDialogTree.js";

const TYPING_SPEED = 10; //ms between letter
const SCREEN_PADDING = 20;

class DialogSceneApp extends PIXI.Application {
  constructor(options, dialogTree){
    super(options);
    this.dialogTree = dialogTree;
    this._currentPrompt = undefined;

    //Add all the elements
    let background = this._background = new PIXI.Sprite(
      PIXI.loader.resources.bedroom.texture
    );
    let backgroundAspect = background.height/background.width;
    background.width = this.screen.width;
    background.height= background.width*backgroundAspect;
    this.stage.addChild(background);

    let box = this._dialogBox = new PIXI.Graphics();
    box.beginFill(0xFFF0CC);
    box.lineStyle(4, 0xFF3300, 1);
    box.drawRect(0,0,500,200);
    box.endFill();
    this.stage.addChild(box);
    let frame = new PIXI.mesh.NineSlicePlane(PIXI.loader.resources.dialogFrame.texture, 117, 117, 117, 117);
    frame.width = 1000;
    frame.height = 400;
    frame.scale.x = 0.5;
    frame.scale.y = 0.5;
    this._dialogBox.addChild(frame);

    let name = this._dialogName = new PIXI.Text("NAME", {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
    name.position.x = 50;
    name.position.y = 50;
    this._dialogBox.addChild(name);

    let text = this._dialogText = new PIXI.Text("Initial Text", {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'left', wordWrap: true, wordWrapWidth: 400});
    text.position.x = 50;
    text.position.y = 80;
    this._dialogInterval = undefined;
    this._dialogBox.addChild(text);

    let face1 = this._leftFace = new PIXI.Sprite(
      PIXI.loader.resources.mc.texture
    );
    let face1Aspect = face1.height/face1.width;
    face1.width = 400;
    face1.height= face1.width*face1Aspect;
    this.stage.addChild(face1);

    let face2 = this._rightFace = new PIXI.Sprite(
      PIXI.loader.resources.carl.texture
    );
    let face2Aspect = face2.height/face2.width;
    face2.width = 400;
    face2.height= face2.width*face2Aspect;
    this.stage.addChild(face2);
  }

  get isTyping(){
    return !!this._dialogInterval;
  }

  nextScene(){
    this._currentPrompt = this.dialogTree.getPrompt();
    let { placement, name, options } = this._currentPrompt;
    let boxBounds = this._dialogBox.getBounds();
    this._dialogBox.x = placement === "left" ? SCREEN_PADDING : (this.screen.width - SCREEN_PADDING - boxBounds.width);
    this._dialogBox.y = this.screen.height - SCREEN_PADDING - boxBounds.height;
    this._dialogName.text = name;

    this._leftFace.x = 20;
    this._leftFace.y = this.screen.height/3;
    this._leftFace.tint = placement === "left" ? 0xFFFFFF : 0x444444;

    this._rightFace.x = (this.screen.width - SCREEN_PADDING - this._rightFace.getBounds().width);
    this._rightFace.y = this.screen.height/3;
    this._rightFace.tint = placement === "left" ? 0x444444 : 0xFFFFFF;

    if(options) {
      options.forEach((option, idx)=>{
        let button = new PIXI.mesh.NineSlicePlane(PIXI.loader.resources.buttonFrame.texture, 117, 117, 117, 117);
        button.width = 200 * 4;
        button.height = 70 * 4;
        button.scale.x = 0.25;
        button.scale.y = 0.25;
        button.position.x = 30;
        button.position.y = 30 + 50 * idx;
        this._dialogBox.addChild(button);

        let buttonText = new PIXI.Text(option, {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'left'});
        buttonText.position.x = 20 * 4;
        buttonText.position.y = 20 * 4;
        buttonText.scale.x = 4;
        buttonText.scale.y = 4;
        button.addChild(buttonText);
      });
    }

    this.startTyping();
  }

  startTyping(){
    if(this._dialogInterval) {
      //Clear previous dialog
      this.stopTyping();
    }

    //Start a new dialog
    let letters = this._currentPrompt.phrase.split("");
    let currLetter = 0;
    this._dialogInterval = setInterval(()=>{
      this._dialogText.text = letters.slice(0,currLetter).join("");
      currLetter++;
      if(currLetter > this._currentPrompt.phrase.length) {
        this.stopTyping();
        return;
      }
    }, TYPING_SPEED);
  }

  stopTyping(){
    clearInterval(this._dialogInterval);
    this._dialogInterval = undefined;
  }

  endCurrentTypingPhrase() {
    this.stopTyping();
    this._dialogText.text = this._currentPrompt.phrase;
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
PIXI.loader
  //Backgrounds
  .add("bedroom", "images/bedroom.png")
  //Characters
  .add("carl", "images/crepycarl.png")
  .add("mc", "images/mc.png")
  //Other assets
  .add("dialogFrame", "images/frameyboi.png")
  .add("buttonFrame", "images/frameyboi.png")
  .load(()=>{
    //WIRE UP THE APP
    const app = new DialogSceneApp({
      antialias: true,
      width: window.innerWidth,
      height: window.innerHeight
    }, dialogTree);
    document.body.appendChild(app.view);

    ["mouseup", "touchend"].forEach((eventName)=>{
      app.view.addEventListener(eventName, ()=>{
        if(app.isTyping) {
          app.endCurrentTypingPhrase();
        }
        else {
          app.nextScene();
        }
      });
    });
  });
});