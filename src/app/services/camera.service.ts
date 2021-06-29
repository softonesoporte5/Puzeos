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

  async openGallery(){
    const image = await Camera.getPhoto({
      source:CameraSource.Photos,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

    console.log(image)

     /* Camera.getPhoto({
        source:CameraSource.Photos,
        resultType:CameraResultType.Uri,
      }).then(resp=>{
        console.log(resp);
      })*/
  }

  takePicture = async(user:IUser)=>{
    const cameraPhoto = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

    const base64Data = await this.readAsBase64(cameraPhoto);

    const response = await fetch(cameraPhoto.webPath);
    const blob = await response.blob();

  //   ImageCropxPlugin.show({
  //     source:base64Data,
  //     width:300,
  //     height:300,
  //     ratio:"16:9"
  // }).then(response =>{
  //    console.log(response);
  // })
  // .catch(err =>{console.log(err)})

    //Agregar a firebaseStorage
    const photoFirebase=await this.firebaseStorage.uploadPhoto(blob, user);
    console.log(photoFirebase);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';

    return {
      filepath: fileName,
      firebasePath:photoFirebase,
      base64Data:base64Data
    };
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {

    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto.webPath);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
