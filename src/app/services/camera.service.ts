import { Subject, Subscription } from 'rxjs';
import { CropperjsService } from './cropperjs.service';
import { FirebaseStorageService } from './firebase-storage.service';
import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, CameraPhoto, FilesystemDirectory, FilesystemEncoding, Capacitor, CameraSource } from '@capacitor/core';
//import { CropResult } from '@triplesense/capacitor-image-cropx';
import { IUser } from '../chat/interfaces/user.interface';

const { Camera, Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class CameraService {

  base64Data$=new Subject<string>();
  cropperImage$=new Subject<string>();
  cropperSubscribe:Subscription;

  constructor(
    private firebaseStorage:FirebaseStorageService,
  ) {

  }

  takePicture = async(user:IUser,source:CameraSource)=>{
    if(this.cropperSubscribe){
      this.cropperSubscribe.unsubscribe();
    }
    const cameraPhoto = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.DataUrl,
      source:source,
    });

    this.base64Data$.next(cameraPhoto.dataUrl);

    const cropperData:string=await new Promise((resolve, rejeact)=>{
      this.cropperSubscribe=this.getCropperImage()
      .subscribe((resp:string)=>{
        resolve(resp);
      })
    });

    //Agregar a firebaseStorage
    const photoFirebase=await this.firebaseStorage.uploadPhoto(cropperData, user);
    console.log(photoFirebase);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';

    const localImg=await Filesystem.writeFile({
      path:fileName,
      data:cropperData,
      directory:FilesystemDirectory.Data
    });
    return {
      filepath: localImg.uri,
      firebasePath:photoFirebase,
      base64Data:cropperData
    };
  }

  getImageData(){
    return this.base64Data$.asObservable();
  }

  getCropperImage(){
    return this.cropperImage$.asObservable();
  }
}
