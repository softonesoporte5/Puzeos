import { ModalController, NavParams } from '@ionic/angular';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { CameraService } from './../../../services/camera.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-cropper-modal',
  templateUrl: './image-cropper-modal.component.html',
  styleUrls: ['./image-cropper-modal.component.scss'],
})
export class ImageCropperModalComponent implements OnInit {

  croppedImage: any = '';
  base64Image:string;
  @ViewChild(ImageCropperComponent, {static: false}) angularCropper:ImageCropperComponent;

  constructor(
    private camara:CameraService,
    private navParams:NavParams,
    private modalController:ModalController
  ) { }

  ngOnInit() {
    this.base64Image=this.navParams.get("base64")
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  close(){
    this.modalController.dismiss();
  }

  save(){
    this.angularCropper.crop();
    this.camara.cropperImage$.next(this.croppedImage);
    this.modalController.dismiss();
  }

}
