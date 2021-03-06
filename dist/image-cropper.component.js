var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ViewChild } from '@angular/core';
var ImageCropperComponent = /** @class */ (function () {
    function ImageCropperComponent() {
        this.crop = new Crop();
    }
    ImageCropperComponent.prototype.ngAfterViewInit = function () {
        this.canvas = this.canvas.nativeElement;
        this.context = this.canvas.getContext("2d");
        // let rect = this.canvas.parentNode.nativeElement;
        // this.canvas.width = rect.width;
        // this.canvas.height = rect.height;
        this.crop.imageW = this.canvas.width;
        this.crop.imageH = this.canvas.height;
        this.tick();
    };
    //Listen for Image Changes
    ImageCropperComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        if (changes.inputImage) {
            var image = new Image;
            image.src = changes.inputImage.currentValue;
            image.onload = function () {
                _this.setImage(image);
            };
        }
    };
    //Render 
    ImageCropperComponent.prototype.tick = function () {
        var _this = this;
        requestAnimationFrame(function () {
            _this.tick();
            if (_this.image) {
                var crop = _this.crop;
                var ctx = _this.context;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(_this.image, 0, 0, _this.crop.imageW, _this.crop.imageH);
                _this.crop.draw(ctx);
            }
        });
    };
    ImageCropperComponent.prototype.setImage = function (image) {
        this.image = image;
        if (image.width > image.height) {
            this.crop.imageW = this.canvas.width;
            this.crop.imageH = (image.height * this.canvas.width) / image.width;
        }
        else {
            this.crop.imageW = (image.width * this.canvas.height) / image.height;
            this.crop.imageH = this.canvas.height;
        }
    };
    //When mouse clicked start resizing or moving
    ImageCropperComponent.prototype.onMouseButton = function (event) {
        var _this = this;
        var x = event.layerX;
        var y = event.layerY;
        if (event.buttons === 1) {
            this.crop.overlapControls(x, y, function (controlHandle) {
                if (controlHandle) {
                    controlHandle.startResize();
                    _this.isResizingCropper = true;
                    _this.isMovingCropper = true;
                    _this.resizeCropperHandle = controlHandle;
                    return;
                }
            });
            if (this.crop.overlap(x, y)) {
                this.crop.startMove(x, y);
                this.isMovingCropper = true;
            }
        }
        else {
            this.crop.stopMove();
            this.crop.stopResize();
            this.isMovingCropper = false;
            this.isResizingCropper = false;
        }
    };
    ImageCropperComponent.prototype.onMouseMove = function (event) {
        var x = event.layerX;
        var y = event.layerY;
        this.changeCursor(x, y);
        if (this.isResizingCropper) {
            if (this.crop.isFixedResize) {
                this.resizeCropperHandle.performFixedResize(x, y);
                this.crop.performResize();
            }
            else {
                this.resizeCropperHandle.performResize(x, y);
                this.crop.performResize();
            }
        }
        else if (this.isMovingCropper) {
            this.crop.performMove(x, y);
        }
    };
    //takes care of changing the cursor
    ImageCropperComponent.prototype.changeCursor = function (x, y) {
        var _this = this;
        if (this.isMovingCropper || this.isResizingCropper) {
            return;
        }
        if (this.crop.overlap(x, y)) {
            this.cursorStyleName = "move";
        }
        else {
            this.cursorStyleName = "default";
            this.crop.overlapControls(x, y, function (controlHandle) {
                if (controlHandle) {
                    switch (controlHandle.controlIndex) {
                        case cropControlsIndicies.TL:
                            _this.cursorStyleName = "nw-resize";
                            break;
                        case cropControlsIndicies.TR:
                            _this.cursorStyleName = "ne-resize";
                            break;
                        case cropControlsIndicies.BL:
                            _this.cursorStyleName = "sw-resize";
                            break;
                        case cropControlsIndicies.BR:
                            _this.cursorStyleName = "se-resize";
                            break;
                    }
                }
            });
        }
    };
    ImageCropperComponent.prototype.getCursorStyle = function () {
        return this.cursorStyleName;
    };
    ImageCropperComponent.prototype.getCropBlob = function (callback) {
        var _this = this;
        //Store original canvas size
        var originalCanvasW = this.canvas.width;
        var originalCanvasH = this.canvas.height;
        //Resize cropper for max resolution
        // this.canvas.width = this.image.width;
        // this.canvas.height = this.image.height;
        var ctx = this.context;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(this.image, 0, 0, this.crop.imageW, this.crop.imageH);
        var imageData = ctx.getImageData(this.crop.posX, this.crop.posY, this.crop.width, this.crop.height);
        //Just repurpose the canvas 
        this.canvas.width = this.crop.width;
        this.canvas.height = this.crop.height;
        ctx.putImageData(imageData, 0, 0);
        this.canvas.toBlob(function (blob) {
            callback(blob);
            _this.canvas.width = originalCanvasW;
            _this.canvas.height = originalCanvasH;
        });
    };
    //@TODO test this out
    ImageCropperComponent.prototype.getImageDataURL = function (params, callback) {
        //Store original canvas size
        var originalCanvasW = this.canvas.width;
        var originalCanvasH = this.canvas.height;
        //Resize cropper for max resolution
        // this.canvas.width = this.image.width;
        // this.canvas.height = this.image.height;
        var ctx = this.context;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(this.image, 0, 0, this.crop.imageW, this.crop.imageH);
        var imageData = ctx.getImageData(this.crop.posX, this.crop.posY, this.crop.width, this.crop.height);
        //Just repurpose the canvas 
        this.canvas.width = this.crop.width;
        this.canvas.height = this.crop.height;
        ctx.putImageData(imageData, 0, 0);
        callback(this.canvas.toDataUrl(params));
    };
    ImageCropperComponent.prototype.ngOnInit = function () {
    };
    __decorate([
        Input('inputImage'),
        __metadata("design:type", Object)
    ], ImageCropperComponent.prototype, "inputImage", void 0);
    __decorate([
        ViewChild('imageCanvas'),
        __metadata("design:type", Object)
    ], ImageCropperComponent.prototype, "canvas", void 0);
    ImageCropperComponent = __decorate([
        Component({
            selector: 'image-cropper',
            templateUrl: './image-cropper.component.html',
            styleUrls: ['./image-cropper.component.css']
        }),
        __metadata("design:paramtypes", [])
    ], ImageCropperComponent);
    return ImageCropperComponent;
}());
export { ImageCropperComponent };
var Square = /** @class */ (function () {
    function Square() {
    }
    // Checks if a point is within the square
    Square.prototype.overlap = function (x, y) {
        if ((x > this.posX && y > this.posY) && (x < (this.posX + this.width) && y < (this.posY + this.height))) {
            return true;
        }
        else {
            return false;
        }
    };
    Square.prototype.distance = function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ^ 2 + (y2 - y1) ^ 2);
    };
    return Square;
}());
var cropControlsIndicies;
(function (cropControlsIndicies) {
    cropControlsIndicies[cropControlsIndicies["TL"] = 0] = "TL";
    cropControlsIndicies[cropControlsIndicies["TR"] = 1] = "TR";
    cropControlsIndicies[cropControlsIndicies["BL"] = 2] = "BL";
    cropControlsIndicies[cropControlsIndicies["BR"] = 3] = "BR";
})(cropControlsIndicies || (cropControlsIndicies = {}));
//Holds information for Control handles
var CropControlHandle = /** @class */ (function (_super) {
    __extends(CropControlHandle, _super);
    function CropControlHandle(index, owningClass) {
        var _this = _super.call(this) || this;
        _this.controlIndex = index;
        _this.owningClass = owningClass;
        _this.size = 10;
        _this.width = _this.height = _this.size;
        _this.halfSize = _this.size / 2;
        _this.performMove(); // Same as initializing the positions
        return _this;
    }
    //Position our control handle at the corner depending on the index before drawing
    CropControlHandle.prototype.performMove = function () {
        switch (this.controlIndex) {
            //Top left
            case cropControlsIndicies.TL: {
                this.posX = this.owningClass.posX;
                this.posY = this.owningClass.posY;
                break;
            }
            //Top Right
            case cropControlsIndicies.TR: {
                this.posX = this.owningClass.posX + this.owningClass.width;
                this.posY = this.owningClass.posY;
                break;
            }
            //Bottom left
            case cropControlsIndicies.BL: {
                this.posX = this.owningClass.posX;
                this.posY = this.owningClass.posY + this.owningClass.height;
                break;
            }
            // Bottom right
            case cropControlsIndicies.BR: {
                this.posX = this.owningClass.posX + this.owningClass.width;
                this.posY = this.owningClass.posY + this.owningClass.height;
                break;
            }
        }
        this.posX -= this.halfSize;
        this.posY -= this.halfSize;
    };
    CropControlHandle.prototype.startResize = function () {
        this.oldX = this.owningClass.posX;
        this.oldY = this.owningClass.posY;
        this.oldW = this.owningClass.width;
        this.oldH = this.owningClass.height;
    };
    CropControlHandle.prototype.performResize = function (x, y) {
        switch (this.controlIndex) {
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
    };
    CropControlHandle.prototype.performFixedResize = function (x, y) {
        var distanceX;
        var distanceY;
        switch (this.controlIndex) {
            //Top left
            case cropControlsIndicies.TL: {
                distanceX = x - this.oldX;
                distanceY = y - this.oldY;
                if ((distanceX) < (distanceY)) {
                    this.owningClass.newW = this.oldW - distanceX;
                    this.owningClass.newH = this.oldH - distanceX;
                    this.owningClass.newX = x;
                    this.owningClass.newY = this.oldY + distanceX;
                }
                else {
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
                if ((distanceX) < (distanceY)) {
                    this.owningClass.newW = this.oldW - distanceX;
                    this.owningClass.newH = this.oldH - distanceX;
                    this.owningClass.newY = this.oldY + distanceX;
                }
                else {
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
                if ((distanceX) < (distanceY)) {
                    this.owningClass.newW = this.oldW - distanceX;
                    this.owningClass.newH = this.oldH - distanceX;
                    this.owningClass.newX = x;
                }
                else {
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
                if ((distanceX) < (distanceY)) {
                    this.owningClass.newW = this.oldW - distanceX;
                    this.owningClass.newH = this.oldH - distanceX;
                }
                else {
                    this.owningClass.newW = this.oldW - distanceY;
                    this.owningClass.newH = this.oldH - distanceY;
                }
                break;
            }
        }
        this.owningClass.applyNewTransforms();
    };
    //draw the control handle
    CropControlHandle.prototype.draw = function (ctx) {
        ctx.fillStyle = "rgba(130, 180, 255, 0.9)";
        ctx.fillRect(this.posX, this.posY, this.width, this.height);
    };
    return CropControlHandle;
}(Square));
//Holds information for the part of the image thats being cropped
var Crop = /** @class */ (function (_super) {
    __extends(Crop, _super);
    function Crop() {
        var _this = _super.call(this) || this;
        _this.cropControls = [];
        _this.outlineColor = "rgba(130, 180, 255, 0.9)";
        _this.shadeOutColor = 'rgba(0,0,0,0.75)';
        _this.isFixedResize = true;
        _this.posX = 10;
        _this.posY = 10;
        _this.offsetX = 0;
        _this.offsetY = 0;
        _this.width = 100;
        _this.height = 100;
        //initialize the new values just so it doesnt fuck up on the fisrt move
        _this.newX = _this.posX;
        _this.newY = _this.posY;
        _this.newW = _this.width;
        _this.newH = _this.height;
        //Create 4 crop controls and give them all a control index
        for (var i = 0; i < 4; i++) {
            var newCropControl = new CropControlHandle(i, _this);
            _this.cropControls.push(newCropControl);
        }
        return _this;
    }
    //checks if one of the control handles is overlapped
    Crop.prototype.overlapControls = function (x, y, callback) {
        this.cropControls.forEach(function (control) {
            if (control.overlap(x, y)) {
                callback(control);
            }
            else {
                callback(null);
            }
        });
    };
    Crop.prototype.startResize = function () {
    };
    Crop.prototype.performResize = function () {
        var _this = this;
        this.cropControls.forEach(function (control) {
            control.performMove(_this);
        });
    };
    Crop.prototype.stopResize = function () {
        var _this = this;
        this.cropControls.forEach(function (control) {
            control.performMove(_this);
        });
    };
    // set an offset for the crop square
    Crop.prototype.startMove = function (offsetX, offsetY) {
        this.offsetX = offsetX - this.posX;
        this.offsetY = offsetY - this.posY;
    };
    Crop.prototype.performMove = function (moveX, moveY) {
        var _this = this;
        this.newX = moveX - this.offsetX;
        this.newY = moveY - this.offsetY;
        this.applyNewTransforms();
        this.cropControls.forEach(function (control) {
            control.performMove(_this);
        });
    };
    // zero out the offsets
    Crop.prototype.stopMove = function () {
        this.offsetX = 0;
        this.offsetY = 0;
    };
    Crop.prototype.draw = function (ctx) {
        //draw boxes around crop area
        ctx.fillStyle = this.shadeOutColor;
        ctx.fillRect(0, 0, this.posX, ctx.canvas.height);
        ctx.fillRect(this.posX, 0, ctx.canvas.width, this.posY);
        ctx.fillRect(this.posX + this.width, this.posY, ctx.canvas.width, ctx.canvas.height - this.posY);
        ctx.fillRect(this.posX, this.posY + this.height, this.width, ctx.canvas.height);
        this.cropControls.forEach(function (control) {
            control.draw(ctx);
        });
        //draw outline lines
        ctx.strokeStyle = this.outlineColor;
        ctx.strokeRect(this.posX, this.posY, this.width, this.height);
    };
    Crop.prototype.applyNewTransforms = function () {
        //Make sure we cant invert the crop
        if (this.newW < 20)
            this.newW = 20;
        if (this.newH < 20)
            this.newH = 20;
        //Make sure our new transforms arent out of bounds
        if ((this.newX + this.newW) > this.imageW)
            this.newX -= (this.newX + this.newW) - this.imageW;
        if ((this.newY + this.newH) > this.imageH)
            this.newY -= (this.newY + this.newH) - this.imageH;
        if (this.newX < 0)
            this.newX = 0;
        if (this.newY < 0)
            this.newY = 0;
        this.posX = this.newX;
        this.posY = this.newY;
        this.width = this.newW;
        this.height = this.newH;
    };
    return Crop;
}(Square));
//# sourceMappingURL=image-cropper.component.js.map