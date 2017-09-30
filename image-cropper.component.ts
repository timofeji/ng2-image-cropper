import { Component, ElementRef, Input, ViewChild, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})


export class ImageCropperComponent implements OnInit {

  @Input('inputImage') public inputImage:any;
  @ViewChild('imageCanvas') public canvas;
  context: CanvasRenderingContext2D;

  crop:Crop;
  isMovingCropper:boolean;
  isResizingCropper:boolean;
  resizeCropperHandle:CropControlHandle;
  cursorStyleName:any;

  image:any;
  croppedImage:any;

  constructor() { this.crop = new Crop(); }

  ngAfterViewInit() {
    this.canvas = this.canvas.nativeElement;
    this.context = this.canvas.getContext("2d");
    
    // let rect = this.canvas.parentNode.nativeElement;
    // this.canvas.width = rect.width;
    // this.canvas.height = rect.height;

    this.crop.imageW = this.canvas.width;
    this.crop.imageH = this.canvas.height;
    this.tick();
  }
  
  //Listen for Image Changes
  ngOnChanges(changes:SimpleChanges){
    if(changes.inputImage){
      var image = new Image;
      image.src = changes.inputImage.currentValue;
      image.onload = () => {
        this.setImage(image);
      }
    }
  }
  

  //Render 
  tick(){
    requestAnimationFrame(()=> {
      this.tick()
      if(this.image){
        var crop = this.crop;
        var ctx = this.context;
        ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(this.image, 0, 0, this.crop.imageW, this.crop.imageH); 
        this.crop.draw(ctx);
      }
    });
  }

  public setImage(image:HTMLImageElement) {
    this.image = image;
    if(image.width >  image.height){
      this.crop.imageW = this.canvas.width;
      this.crop.imageH = (image.height * this.canvas.width) / image.width;  
      
    } else {
      this.crop.imageW = (image.width * this.canvas.height) / image.height;
      this.crop.imageH = this.canvas.height;
    }

  }

  //When mouse clicked start resizing or moving
  private onMouseButton(event: MouseEvent) {
    let x = event.layerX;
    let y = event.layerY;

    if(event.buttons === 1){
      this.crop.overlapControls(x, y, (controlHandle) => {
        if(controlHandle){
          controlHandle.startResize();
          this.isResizingCropper = true;
          this.isMovingCropper = true;
          this.resizeCropperHandle = controlHandle;
          return; 
        }
      })

      if(this.crop.overlap(x, y)){
        this.crop.startMove(x, y);
        this.isMovingCropper = true;
      }
    } else {
      this.crop.stopMove();
      this.crop.stopResize();
      this.isMovingCropper = false;
      this.isResizingCropper = false;
    }
  }

  private onMouseMove(event: MouseEvent){
    let x = event.layerX;
    let y = event.layerY;

    this.changeCursor(x,y);

    if(this.isResizingCropper){
      if(this.crop.isFixedResize){
        this.resizeCropperHandle.performFixedResize(x,y);
        this.crop.performResize();
      } else {
        this.resizeCropperHandle.performResize(x,y);
        this.crop.performResize();
      }
    } else if(this.isMovingCropper){
      this.crop.performMove(x, y);
    }
  }

  //takes care of changing the cursor
  private changeCursor(x,y){
    if(this.isMovingCropper || this.isResizingCropper){
      return
    }
    if(this.crop.overlap(x,y)){
      this.cursorStyleName = "move"
    } else {
      this.cursorStyleName = "default"
      this.crop.overlapControls(x, y, (controlHandle) => {
        if(controlHandle){
          switch (controlHandle.controlIndex){
            case cropControlsIndicies.TL:
              this.cursorStyleName = "nw-resize";
              break;
            case cropControlsIndicies.TR:
              this.cursorStyleName = "ne-resize";
              break;
            case cropControlsIndicies.BL:
              this.cursorStyleName = "sw-resize";
              break;
            case cropControlsIndicies.BR:
              this.cursorStyleName = "se-resize";
              break;
          }
        }
      })
    }
  }

  private getCursorStyle(){
    return this.cursorStyleName;
  }
  

  public getCropBlob(callback){

    //Store original canvas size
    let originalCanvasW = this.canvas.width;
    let originalCanvasH = this.canvas.height;

    //Resize cropper for max resolution
    // this.canvas.width = this.image.width;
    // this.canvas.height = this.image.height;

    let ctx = this.context;

    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(this.image, 0, 0, this.crop.imageW, this.crop.imageH); 
    let imageData = ctx.getImageData(this.crop.posX, this.crop.posY, this.crop.width, this.crop.height);

    //Just repurpose the canvas 
    this.canvas.width = this.crop.width;
    this.canvas.height = this.crop.height;

    ctx.putImageData(imageData,0,0);

    this.canvas.toBlob((blob) =>{
      callback(blob);
      this.canvas.width = originalCanvasW;
      this.canvas.height = originalCanvasH;
    });
    
  }

  //@TODO test this out
  public getImageDataURL(params,callback){
    //Store original canvas size
    let originalCanvasW = this.canvas.width;
    let originalCanvasH = this.canvas.height;

    //Resize cropper for max resolution
    // this.canvas.width = this.image.width;
    // this.canvas.height = this.image.height;

    let ctx = this.context;

    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(this.image, 0, 0, this.crop.imageW, this.crop.imageH); 
    let imageData = ctx.getImageData(this.crop.posX, this.crop.posY, this.crop.width, this.crop.height);

    //Just repurpose the canvas 
    this.canvas.width = this.crop.width;
    this.canvas.height = this.crop.height;

    ctx.putImageData(imageData,0,0);

    callback(this.canvas.toDataUrl(params));
  }

  ngOnInit() {

  }

}

class Square{
  posX:any;
  posY:any;
  width:any;
  height:any;

  // Checks if a point is within the square
  overlap(x, y): boolean{
    if( (x > this.posX && y > this.posY) && (x < (this.posX + this.width) && y < (this.posY + this.height))){
      return true
    }
    else {
      return false;
    }
  }
  
  distance(x1, y1, x2,y2){
    return Math.sqrt((x2 - x1)^2 + (y2 - y1)^2);
  }
}

enum cropControlsIndicies {TL, TR, BL, BR}

//Holds information for Control handles
class CropControlHandle extends Square {
  size:any;
  halfSize: any;
  controlIndex: any;
  owningClass: Crop;

  //Old stats for Crop
  oldX:any;
  oldY:any;
  oldW:any;
  oldH:any;


  constructor( index, owningClass:Crop) {
    super();
    this.controlIndex = index;
    this.owningClass = owningClass;
    this.size = 10;
    this.width = this.height = this.size;
    this.halfSize = this.size/2;

    this.performMove(); // Same as initializing the positions
  }

  //Position our control handle at the corner depending on the index before drawing
  performMove(){
    switch(this.controlIndex) {
      //Top left
      case cropControlsIndicies.TL: {
        this.posX = this.owningClass.posX;
        this.posY = this.owningClass.posY
        break;
      }
      //Top Right
      case cropControlsIndicies.TR:{
        this.posX = this.owningClass.posX + this.owningClass.width;
        this.posY = this.owningClass.posY;
        break;
      }
      //Bottom left
      case cropControlsIndicies.BL:{
        this.posX = this.owningClass.posX;
        this.posY = this.owningClass.posY + this.owningClass.height;
        break;
      }
      // Bottom right
      case cropControlsIndicies.BR:{
        this.posX = this.owningClass.posX + this.owningClass.width;
        this.posY = this.owningClass.posY + this.owningClass.height;
        break;
      }
    }
    this.posX -= this.halfSize;
    this.posY -= this.halfSize;
  }

  startResize(){
    this.oldX = this.owningClass.posX;
    this.oldY = this.owningClass.posY;
    this.oldW = this.owningClass.width;
    this.oldH = this.owningClass.height;    
  }

  performResize(x,y){
    switch(this.controlIndex) {
      //Top left
      case cropControlsIndicies.TL: {
        this.owningClass.newX = x;
        this.owningClass.newY = y;
        this.owningClass.newW = this.oldW + (this.oldX - x);
        this.owningClass.newH = this.oldH + (this.oldY - y);
        break;
      }
      //Top Right
      case cropControlsIndicies.TR: {
        this.owningClass.newY = y;
        this.owningClass.newW = (x - this.oldX);
        this.owningClass.newH = this.oldH + (this.oldY - y);
        break;
      }
      //Bottom left
      case cropControlsIndicies.BL: {
        this.owningClass.newX = x;
        this.owningClass.newW = this.oldW + (this.oldX - x);
        this.owningClass.newH = (y - this.oldY);
        break;
      }
      // Bottom right
      case cropControlsIndicies.BR: {
        this.owningClass.newW = (x - this.oldX);
        this.owningClass.newH = (y - this.oldY);
        break;
      }
    }
    this.owningClass.applyNewTransforms();
  }

  performFixedResize(x,y){
    var distanceX;
    var distanceY;

    switch(this.controlIndex) {
      //Top left
      case cropControlsIndicies.TL: {
        distanceX = x - this.oldX;
        distanceY = y - this.oldY; 
        if((distanceX) < (distanceY)) {
          this.owningClass.newW = this.oldW - distanceX;
          this.owningClass.newH = this.oldH - distanceX;
          this.owningClass.newX = x;
          this.owningClass.newY = this.oldY + distanceX;
        } else {
          this.owningClass.newW = this.oldW - distanceY;
          this.owningClass.newH = this.oldH - distanceY;
          this.owningClass.newX = this.oldX + distanceY;
          this.owningClass.newY = y;
        }
        break;
      }
      //Top Right
      case cropControlsIndicies.TR: {
        distanceX = (this.oldX + this.oldW) - x;
        distanceY = y - this.oldY; 
        if((distanceX) < (distanceY)) {
          this.owningClass.newW= this.oldW - distanceX;
          this.owningClass.newH = this.oldH - distanceX;
          this.owningClass.newY = this.oldY + distanceX;
        } else {
          this.owningClass.newW = this.oldW - distanceY;
          this.owningClass.newH = this.oldH - distanceY;
          this.owningClass.newY = y;
        }
        break;
      }
      //Bottom left
      case cropControlsIndicies.BL: {
        distanceX = x - this.oldX;
        distanceY = (this.oldY + this.oldH) - y; 
        if((distanceX) < (distanceY)) {
          this.owningClass.newW = this.oldW - distanceX;
          this.owningClass.newH = this.oldH - distanceX;
          this.owningClass.newX = x;
        } else {
          this.owningClass.newW = this.oldW - distanceY;
          this.owningClass.newH = this.oldH - distanceY;
          this.owningClass.newX = this.oldX + distanceY;
        }
        break;
      }
      // Bottom right
      case cropControlsIndicies.BR: {
        distanceX = (this.oldX + this.oldW) - x;
        distanceY = (this.oldY + this.oldH) - y; 
        if((distanceX) < (distanceY)) {
          this.owningClass.newW = this.oldW - distanceX;
          this.owningClass.newH = this.oldH - distanceX;
        } else {
          this.owningClass.newW = this.oldW - distanceY;
          this.owningClass.newH = this.oldH - distanceY;
        }
        break;
      }
    }
    this.owningClass.applyNewTransforms();
  }


  //draw the control handle
  draw(ctx) {
    ctx.fillStyle = "rgba(130, 180, 255, 0.9)";
    ctx.fillRect(this.posX, this.posY, this.width, this.height);
  }
}


//Holds information for the part of the image thats being cropped
class Crop extends Square{
  outlineColor:any;
  shadeOutColor:any;

  isFixedResize:boolean;

  offsetX:any;
  offsetY:any;

  imageW:any;
  imageH:any;

   //Target stats for crop
   newX:any;
   newY:any;
   newW:any;
   newH:any;

  cropControls = [];

  constructor(){
    super();

    this.outlineColor = "rgba(130, 180, 255, 0.9)";
    this.shadeOutColor = 'rgba(0,0,0,0.75)';
    this.isFixedResize = true;

    this.posX = 10;
    this.posY = 10;
    this.offsetX = 0;
    this.offsetY = 0;
    this.width = 100;
    this.height = 100;

    //initialize the new values just so it doesnt fuck up on the fisrt move
    this.newX = this.posX;
    this.newY = this.posY;
    this.newW = this.width;
    this.newH = this.height;

    //Create 4 crop controls and give them all a control index
    for (var i = 0; i < 4; i++) {
      let newCropControl = new CropControlHandle(i, this);
      this.cropControls.push(newCropControl);
    }

  }
  //checks if one of the control handles is overlapped
  overlapControls(x, y, callback){
    this.cropControls.forEach(control => {
      if(control.overlap(x,y)){
        callback(control);
      } else {
        callback(null);
      }
    });
  }

  startResize(){
    
  }
  performResize(){
    this.cropControls.forEach(control => {
      control.performMove(this);
    }); 
  }
  stopResize(){
    this.cropControls.forEach(control => {
      control.performMove(this);
    }); 
  }

  // set an offset for the crop square
  startMove(offsetX, offsetY){
    this.offsetX = offsetX - this.posX; 
    this.offsetY = offsetY - this.posY;
  }

  performMove(moveX, moveY){
    this.newX = moveX - this.offsetX;
    this.newY = moveY - this.offsetY;
    this.applyNewTransforms();
    this.cropControls.forEach(control => {
      control.performMove(this);
    }); 
    
  }
  // zero out the offsets
  stopMove(){
    this.offsetX = 0;
    this.offsetY = 0;
  }

  draw(ctx){
    //draw boxes around crop area
    ctx.fillStyle = this.shadeOutColor;
    ctx.fillRect(0, 0, this.posX, ctx.canvas.height);
    ctx.fillRect(this.posX, 0, ctx.canvas.width, this.posY );    
    ctx.fillRect(this.posX + this.width, this.posY, ctx.canvas.width, ctx.canvas.height - this.posY );
    ctx.fillRect(this.posX, this.posY + this.height, this.width, ctx.canvas.height ); 

    this.cropControls.forEach(control => {
      control.draw(ctx);
    });

    //draw outline lines
    ctx.strokeStyle = this.outlineColor;
    ctx.strokeRect(this.posX,this.posY,this.width,this.height);
  }

  applyNewTransforms(){
    //Make sure we cant invert the crop
    if(this.newW < 20)
     this.newW = 20;
    if(this.newH < 20)
     this.newH = 20;

    //Make sure our new transforms arent out of bounds
    if ((this.newX + this.newW) > this.imageW)
      this.newX -= (this.newX + this.newW) - this.imageW;
    if ((this.newY + this.newH) > this.imageH)
      this.newY -= (this.newY + this.newH) - this.imageH; 
    if(this.newX < 0)
      this.newX = 0;
    if(this.newY < 0)
      this.newY = 0;
    

 
    this.posX = this.newX;
    this.posY = this.newY;
    this.width = this.newW;
    this.height = this.newH;
    
  } 
}
