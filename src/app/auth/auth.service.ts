import { ImageCropperModalComponent } from './../chat/components/image-cropper-modal/image-cropper.component';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, CameraPhoto, FilesystemDirectory, FilesystemEncoding, Capacitor, CameraSource } from '@capacitor/core';

const { Camera, Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  base64Data$=new Subject<string>();
  cropperImage$=new Subject<string>();
  cropperSubscribe:Subscription;

  constructor(
    private modal:ModalController
  ) { }

  async selectImage(source:CameraSource){

    if(this.cropperSubscribe){
      this.cropperSubscribe.unsubscribe();
    }
    const cameraPhoto = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.DataUrl,
      source:source,
    });

    this.modal.create({
      component:ImageCropperModalComponent,
      componentProps:{
        register:true,
        base64:cameraPhoto.dataUrl
      }
    }).then(modal=>modal.present());

    const cropperData:string=await new Promise((resolve, rejeact)=>{
      this.cropperSubscribe=this.getCropperImage()
      .subscribe((resp:string)=>{
        resolve(resp);
      })
    });

    return cropperData;
  }

  getCropperImage(){
    return this.cropperImage$.asObservable();
  }
}
