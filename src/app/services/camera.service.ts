import { FileSystemService } from './file-system.service';
import { Subject, Subscription } from 'rxjs';
import { FirebaseStorageService } from './firebase-storage.service';
import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { IUser } from '../interfaces/user.interface';

const { Camera } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class CameraService {

  base64Data$=new Subject<string>();
  cropperImage$=new Subject<string>();
  cropperSubscribe:Subscription;

  constructor(
    private firebaseStorage:FirebaseStorageService,
    private fileSystemService:FileSystemService
  ) {}

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

    const fileName = new Date().getTime() + '.jpeg';
    const localImg=await this.fileSystemService.writeFile(cropperData,fileName,"Puzeos Profile/");

    if(localImg){
      //Agregar a firebaseStorage
      const photoFirebase=await this.firebaseStorage.uploadPhoto(cropperData, user,localImg);
      console.log(photoFirebase);

      // Write the file to the data directory

      return {
        filepath: localImg,
        firebasePath:photoFirebase,
        base64Data:cropperData
      };
    }
  }

  getImageData(){
    return this.base64Data$.asObservable();
  }

  getCropperImage(){
    return this.cropperImage$.asObservable();
  }
}
