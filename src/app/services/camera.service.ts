import { Crop } from '@ionic-native/crop/ngx';
import { CropperjsService } from './cropperjs.service';
import { FirebaseStorageService } from './firebase-storage.service';
import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, CameraPhoto, FilesystemDirectory, FilesystemEncoding, Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { IUser } from '../chat/interfaces/user.interface';

const { Camera, Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class CameraService {

  private platform: Platform;

  constructor(
    platform: Platform,
    private firebaseStorage:FirebaseStorageService,
    private cropperjsService:CropperjsService,
    private crop: Crop
  ) {
    this.platform = platform;
  }

  takePicture = async(user:IUser)=>{
    const cameraPhoto = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

    const base64Data = await this.readAsBase64(cameraPhoto);

    this.crop.crop(base64Data, {quality: 75})
    .then(
      newImage => console.log('new image path is: ' + newImage),
      error => console.error('Error cropping image', error)
    );
    const response = await fetch(cameraPhoto.webPath);
    const blob = await response.blob();


    //Agregar a firebaseStorage
    const photoFirebase=await this.firebaseStorage.uploadPhoto(blob, user);
    console.log(photoFirebase);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        firebasePath:photoFirebase,
        base64Data:base64Data
      };
    }
    else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        firebasePath:photoFirebase,
        base64Data:base64Data
      };
    }
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
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
