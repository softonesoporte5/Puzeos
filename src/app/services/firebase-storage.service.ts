import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Injectable } from '@angular/core';
import getBlobDuration from 'get-blob-duration';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class FirebaseStorageService {

  constructor(
    private storage:AngularFireStorage,
    private firestore:AngularFirestore
  ) { }

  uploadAudio(audio:Blob,userName:string,idChat:string){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;
    const refUrl=`${userName}/audios/${randomId}.ogg`;
    const ref = this.storage.ref(refUrl);
    ref.put(audio).then(resp=>{

      getBlobDuration(audio).then(duration=>{
        const duracion=Math.round(duration)/10;//Reparar esto
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
        })
      });

    }).catch(error=>{
      console.log("Error al subir audio",error);
    })
  }

  getAudio(url:string){
    return this.storage.ref(url).getDownloadURL();
  }
}
