import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageCropperComponent } from './image-cropper.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    ImageCropperComponent
  ],
  providers: [],
  exports: [ImageCropperComponent]
})

export class ImageCropperModule {}
