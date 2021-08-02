import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import {Plugins, FilesystemDirectory, FilesystemEncoding} from '@capacitor/core';
const {Filesystem} = Plugins;

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {

  constructor(
    private toastController: ToastController
  ) { }

  async writeFile(data:string, fileName:string, dir:string){
    try{//Se guarda si existe la carpeta Puzeos y la carpeta que se pase por dir
      const fileUrl=await Filesystem.writeFile({
        data:data,
        path: 'Puzeos/'+dir+fileName,
        directory:FilesystemDirectory.ExternalStorage,
        encoding: FilesystemEncoding.UTF8
      });

      return fileUrl.uri;
    }catch(e){
      try{//Se guarda no existe la carpeta Puzeos ni la carpeta que se pase por dir
        await Filesystem.mkdir({
          directory:FilesystemDirectory.ExternalStorage,
          path:"Puzeos/"
        });

        await Filesystem.mkdir({
          directory:FilesystemDirectory.ExternalStorage,
          path:"Puzeos/"+dir
        });

        const fileUrl=await Filesystem.writeFile({
          data:data,
          path: 'Puzeos/'+dir+fileName,
          directory:FilesystemDirectory.ExternalStorage
        });

        return fileUrl.uri;
      }catch(e){
        try{//Se guarda si existe la carpeta Puzeos pero no la carpeta que se pase por dir
          await Filesystem.mkdir({
            directory:FilesystemDirectory.ExternalStorage,
            path:"Puzeos/"+dir
          });

          const fileUrl=await Filesystem.writeFile({
            data:data,
            path: 'Puzeos/'+dir+fileName,
            directory:FilesystemDirectory.ExternalStorage
          });
          return fileUrl.uri;
        }catch(e){
          this.presentAlert("No se pudo guardar el archivo");
          console.log(e);
          return false;
        }
      }
    }
  }

  async presentAlert(mensaje:string){
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 3000,
      color:"danger"
    });
    toast.present();
  }
}
