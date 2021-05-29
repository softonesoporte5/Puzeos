import { Injectable } from '@angular/core';
import Cropper from 'cropperjs';

@Injectable({
  providedIn: 'root'
})
export class CropperjsService {

  constructor() { }

  newCropper(image:any){
    const cropper= new Cropper(image, {
      dragMode: 'crop',
      autoCrop: true,
      movable: true,
      zoomable: true,
      scalable: true,
      autoCropArea: 0.8,
      aspectRatio: 4/4,
      crop(event) {
        console.log(event);
      },
    });
  }
}
