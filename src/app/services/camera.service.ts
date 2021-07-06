import { CropperjsService } from './cropperjs.service';
import { FirebaseStorageService } from './firebase-storage.service';
import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, CameraPhoto, FilesystemDirectory, FilesystemEncoding, Capacitor, CameraSource } from '@capacitor/core';
//import { CropResult } from '@triplesense/capacitor-image-cropx';
import { IUser } from '../chat/interfaces/user.interface';
const { ImageCropxPlugin } = Plugins;

const { Camera, Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class CameraService {


  constructor(
    private firebaseStorage:FirebaseStorageService,
    private cropperjsService:CropperjsService
  ) {}

  takePicture = async(user:IUser,source:CameraSource)=>{
    const cameraPhoto = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.DataUrl,
      source:source,
    });

    console.log(cameraPhoto)
    const base64Data = cameraPhoto.dataUrl

    //Agregar a firebaseStorage
    const photoFirebase=await this.firebaseStorage.uploadPhoto(base64Data, user);
    console.log(photoFirebase);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';

    const localImg=await Filesystem.writeFile({
      path:fileName,
      data:base64Data,
      directory:FilesystemDirectory.Data
    });
    return {
      filepath: localImg.uri,
      firebasePath:photoFirebase,
      base64Data:base64Data
    };
  }
}
