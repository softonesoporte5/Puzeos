import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { IMessage } from './interfaces/message.interface';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Plugins, FilesystemDirectory } from '@capacitor/core';
const { Network, Filesystem } = Plugins;
import * as firebase from 'firebase';

const {  } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class AppService {
  private network$=new Subject<boolean>();
  uploads={};

  constructor(
    private storage:AngularFireStorage,
    private firestore:AngularFirestore
  ){
    Network.addListener('networkStatusChange',status=>{
      this.network$.next(status.connected);
    });

    Network.getStatus()
    .then(resp=>{
      this.network$.next(resp.connected);
    });
  }

  private getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

  convertBlobToBase64=(blob:Blob)=>new Promise((resolve,reject)=>{
    const reader=this.getFileReader();
    reader.onerror=reject;
    reader.onload=()=>resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  getNetworkStatus(){
    return this.network$.asObservable();
  }

  async reUloadAudio(message:IMessage){
    const resp=await Filesystem.readFile({
      path:message.localRef,
      directory:FilesystemDirectory.Data
    });

    const ref = this.storage.ref(message.ref);

    await ref.putString(resp.data, 'data_url');

    await this.firestore.collection("messages").doc(message.idChat).collection("messages").add({
      ...message,
      state:1,
      timestamp:firebase.default.firestore.FieldValue.serverTimestamp()
    });

    return;
  }

  async reUploadFile(data:string, message:IMessage){
    const ref = this.storage.ref(message.ref);
    let upload=ref.putString(data, 'base64');
    this.uploads[message.id]=upload;


    await upload.then(()=>{
      this.firestore.collection("messages").doc(message.idChat).collection("messages").add({
        ...message,
        state:1,
        timestamp:firebase.default.firestore.FieldValue.serverTimestamp()
      });
    });

    return;
  }

}
