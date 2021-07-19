import { IAudioBlob } from './../chat/interfaces/audioBlob.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { IUser } from '../chat/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})

export class FirebaseStorageService {

  constructor(
    private storage:AngularFireStorage,
    private firestore:AngularFirestore,
  ) {
  }

  uploadAudio(audio:IAudioBlob,userName:string,idChat:string,localUrl:string){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;
    const refUrl=`${userName}/audios/${randomId}.ogg`;
    const ref = this.storage.ref(refUrl);

    ref.put(audio.data).then(resp=>{
      this.firestore.collection("messages").doc(idChat).collection("messages").add({
        ref:refUrl,
        user:userName,
        type:"voice",
        duration:audio.duration,
        message:"Nota de voz: "+audio.duration,
        localRef:localUrl,
        timestamp:firebase.default.firestore.FieldValue.serverTimestamp()
      }).catch(error=>{
        console.log(error);
      });
    }).catch(error=>{
      console.log("Error al subir audio",error);
    })
  }

  getAudio(url:string){
    return this.storage.ref(url).getDownloadURL();
  }

  async uploadPhoto(photo:string,user:IUser){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;
    const refUrl=`${user.data.userName}/images/${randomId}.jpeg`;
    const ref = this.storage.ref(refUrl);

    await ref.putString(photo, 'data_url').then(resp=>{
      this.firestore.collection("users").doc(user.id).update({
        imageUrl:refUrl,
      }).catch(error=>{
        console.log(error);
      });
    });

    return refUrl;
  }

  async uploadImageInChat(data:string,userName:string){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;
    const refUrl=`${userName}/send/${randomId}.jpeg`;
    const ref = this.storage.ref(refUrl);

    await ref.putString(data, 'data_url').then(resp=>{

    }).catch(err=>console.log(err));

    return refUrl;
  }

  getImage(url:string){
    return this.storage.ref(url).getDownloadURL();
  }
}
