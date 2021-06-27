import { DbService } from './db.service';
import { ILocalForage } from './../chat/interfaces/localForage.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Injectable } from '@angular/core';
import getBlobDuration from 'get-blob-duration';
import * as firebase from 'firebase';
import { IUser } from '../chat/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})

export class FirebaseStorageService {

  dbChat:ILocalForage;

  constructor(
    private storage:AngularFireStorage,
    private firestore:AngularFirestore,
    private db:DbService
  ) {
    this.dbChat=this.db.loadStore("chats");
  }

  uploadAudio(audio:Blob,userName:string,idChat:string){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;
    const refUrl=`${userName}/audios/${randomId}.ogg`;
    const ref = this.storage.ref(refUrl);
    ref.put(audio).then(resp=>{

      getBlobDuration(audio).then(duration=>{
        let seconds=Math.round(duration);
        let minute:string | number = Math.floor((seconds / 60) % 60);
        minute = (minute < 10)? '0' + minute : minute;
        let second:string | number = seconds % 60;
        second = (second < 10)? '0' + second : second;
        const duracion=minute + ':' + second;

        this.firestore.collection("messages").doc(idChat).collection("messages").add({
          ref:refUrl,
          user:userName,
          type:"voice",
          timestamp:firebase.default.firestore.FieldValue.serverTimestamp()
        }).catch(error=>{
          console.log(error);
        });

        const mensaje="Nota de voz: "+duracion;

        this.firestore.collection("chats").doc(idChat).update({//Agregar ultimo mensaje al chat
          lastMessage:`${mensaje}`
        }).then(()=>{
          this.dbChat.getItem(idChat)
          .then(chat=>{
            this.db.setItemChat(idChat,{
              ...chat,
              lastMessage:mensaje
            })
          }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));
      });

    }).catch(error=>{
      console.log("Error al subir audio",error);
    })
  }

  getAudio(url:string){
    return this.storage.ref(url).getDownloadURL();
  }

  async uploadPhoto(photo:Blob,user:IUser){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;
    const refUrl=`${user.data.userName}/images/${randomId}.jpeg`;
    const ref = this.storage.ref(refUrl);

    await ref.put(photo).then(resp=>{
      this.firestore.collection("users").doc(user.id).update({
        imageUrl:refUrl,
      }).catch(error=>{
        console.log(error);
      });
    });

    return refUrl;
  }
}
