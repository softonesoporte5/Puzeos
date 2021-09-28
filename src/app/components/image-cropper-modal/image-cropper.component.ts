import { AuthService } from './../../auth/auth.service';
import { CameraService } from './../../services/camera.service';
import { ModalController, NavParams } from '@ionic/angular';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-cropper-modal',
  templateUrl: './image-cropper-modal.component.html',
  styleUrls: ['./image-cropper-modal.component.scss'],
})
export class ImageCropperModalComponent implements OnInit {

  croppedImage: any = '';
  imageRegister:boolean=false;
  base64Image:string;
  @ViewChild(ImageCropperComponent, {static: false}) angularCropper:ImageCropperComponent;

  constructor(
    private camara:CameraService,
    private navParams:NavParams,
    private modalController:ModalController,
    private authService:AuthService
  ) { }

  ngOnInit() {
    this.base64Image=this.navParams.get("base64")
    if(this.navParams.get("register")){
      this.imageRegister=true;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  close(){
    this.modalController.dismiss();
  }

  save(){
    this.angularCropper.crop();
    if(this.imageRegister){
      this.authService.cropperImage$.next(this.croppedImage);
    }else{
      this.camara.cropperImage$.next(this.croppedImage);
    }
    this.modalController.dismiss();
  }

}
