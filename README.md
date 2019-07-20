# ng2-image-cropper
Canvas based Angular 2 Image Cropper that supports fixed and freeform resizing


## Installation

##### 1.) Install the package or add it to your angular 2 dependencies
```
  npm install ng2-canvas-image-cropper
```

##### 2.) Import the Image Cropper module in your `app.module.ts` file

```typescript
import { ImageCropperModule } from 'ng2-canvas-image-cropper/image-cropper.module;';

@NgModule({
  declarations: [
    // ...
  ],
  imports: [ 
    // ... 
    ImageCropperModule
  ],
  providers: [
  // ...
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

## Example Usage

##### Example HTML
```html
<image-cropper [inputImage] = "imageData" #imageCropper></image-cropper>

<span>File</span>
<input id= "photo" type="file" accept="image/*" (change)="onFileChanged($event)">

 <button type="submit" (click) = "onSubmitImage()" name="action">Submit</button>
</div>

```

##### Reading file input and passing it to the cropper module
###### `app.component.ts` 
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  imageData: any;
  @ViewChild('imageCropper') imageCropper;
  

  constructor(private backendService: BackendService,
              private elementRef: ElementRef) { 
    this.imageData = {};
  }

  onFileChanged(fileInput){
    if (fileInput.target.files && fileInput.target.files[0]) {
        var reader = new FileReader();
        reader.onload = (e : any) => {
            this.imageData = e.target.result;
        }
        reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
}

```


##### Getting the cropped image
```typescript
onSubmitImage(){

    // Getting a croped image Blob 
    this.imageCropper.getCropBlob((blob) =>{
      let image = blob; 
      if (fileCount > 0) { 
        formData.append('userPhoto', image);
        this.backendService.updateProfilePhoto(formData).subscribe(data =>{
          alert(data.msg);
        });   
      }
    });
    
    // Getting raw URL data
    this.imageCropper.getImageDataURL('image/jpeg',(URL) =>{
      let image = URL; 
      // Do whatever
    });
    
  }
```

## Customizing the cropper
The cropper comes with a handful of settings you can customize to change the appearance and performance of cropper

### the crop object inside the image cropper contains all the settings so if you want to change them you have to initialize them after the image cropper was initialized
##### 'app.component.ts' 
```typescript
  this.imageCropper.crop.outlineColor = 'rgba(130, 180, 255, 0.9)';
  this.imageCropper.crop.shadeOutColor = 'rgba(0,0,0,0.75)';
  this.imageCropper.crop.isFixedResize = true;
  
  //Setting the initial size fixes the ratio of the image cropper if isFixedResize is true
  this.imageCropper.crop.width = 100;
  this.imageCropper.crop.height= 500;
```
