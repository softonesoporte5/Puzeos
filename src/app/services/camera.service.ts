import { CropperjsService } from './cropperjs.service';
import { FirebaseStorageService } from './firebase-storage.service';
import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
//import { CropResult } from '@triplesense/capacitor-image-cropx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { IUser } from '../chat/interfaces/user.interface';
const { ImageCropxPlugin } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class CameraService {


  constructor(
    private firebaseStorage:FirebaseStorageService,
    private cropperjsService:CropperjsService,
    private camera:Camera
  ) {}

  async openGallery(){
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions)
      .then(file_uri => console.log(file_uri),
      err => console.log(err));

     /* Camera.getPhoto({
        source:CameraSource.Photos,
        resultType:CameraResultType.Uri,
      }).then(resp=>{
        console.log(resp);
      })*/
  }

  takePicture = async(user:IUser)=>{
    const cameraPhoto = await this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    });

    const base64Data = 'data:image/jpeg;base64,' + cameraPhoto;

    //const base64Data = await this.readAsBase64(cameraPhoto);

    //const response = await fetch(cameraPhoto.webPath);
    //const blob = await response.blob();

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
    //const photoFirebase=await this.firebaseStorage.uploadPhoto(blob, user);
    //console.log(photoFirebase);

    // Write the file to the data directory
    //const fileName = new Date().getTime() + '.jpeg';

    /*return {
      filepath: fileName,
      firebasePath:photoFirebase,
      base64Data:base64Data
    };*/
  }

  /*private async readAsBase64(cameraPhoto: CameraPhoto) {

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
  });*/
}
