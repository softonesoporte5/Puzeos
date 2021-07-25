import { ILocalForage } from './../chat/interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { AppService } from './../app.service';
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

  networkState:boolean;
  dbNotSendMessages:ILocalForage;

  constructor(
    private storage:AngularFireStorage,
    private firestore:AngularFirestore,
    private appService:AppService,
    private db:DbService
  ) {
    this.appService.getNetworkStatus()
    .subscribe(resp=>this.networkState=resp);
    this.dbNotSendMessages=this.db.loadStore("notSendMessage");
  }

  uploadAudio(audio:IAudioBlob,userName:string,idChat:string,localUrl:string){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+''+date;
    const refUrl=`${userName}/audios/${randomId}.ogg`;

    if(this.networkState){
      const dbMessage=this.db.loadStore("messages"+idChat);

      const newMessage={
        ref:refUrl,
        user:userName,
        type:"voice",
        idChat:idChat,
        id:randomId,
        timestamp:new Date(),
        state:0,
        duration:audio.duration,
        message:"Nota de voz: "+audio.duration,
        localRef:localUrl,
      };

      dbMessage.setItem(randomId,newMessage);

      this.dbNotSendMessages.setItem(randomId,newMessage).then(resp=>{
        Array.prototype.push.apply(this.db.arrMessages[idChat],[resp]);
        this.db.messagesSubscriptions$[idChat].next({resp:[...[resp]],status:1});
      });

      const ref = this.storage.ref(refUrl);

      ref.putString(audio.data, 'data_url').then(()=>{
        this.firestore.collection("messages").doc(idChat).collection("messages").doc(randomId).set({
          ref:refUrl,
          user:userName,
          type:"voice",
          duration:audio.duration,
          message:"Nota de voz: "+audio.duration,
          localRef:localUrl,
          idChat:idChat,
          id:randomId,
          state:1,
          timestamp:firebase.default.firestore.FieldValue.serverTimestamp()
        }).then(()=>{
          this.dbNotSendMessages.removeItem(randomId);
        }).catch(error=>{
          console.log(error);
        });
      }).catch(error=>{
        console.log("Error al subir audio",error);
      });
    }else{
      const dbMessage=this.db.loadStore("messages"+idChat);

      const newMessage={
        ref:refUrl,
        user:userName,
        type:"voice",
        idChat:idChat,
        id:randomId,
        timestamp:new Date(),
        state:0,
        duration:audio.duration,
        message:"Nota de voz: "+audio.duration,
        localRef:localUrl,
      };

      dbMessage.setItem(randomId,newMessage);

      this.dbNotSendMessages.setItem(randomId,newMessage).then(resp=>{
        Array.prototype.push.apply(this.db.arrMessages[idChat],[resp]);
        this.db.messagesSubscriptions$[idChat].next({resp:[...[resp]],status:1});
      });
    }
  }

  getAudio(url:string){
    return this.storage.ref(url).getDownloadURL();
  }

  async uploadPhoto(photo:string,user:IUser,registerPage:boolean=false){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;
    const refUrl=`${user.data.userName}/images/${randomId}.jpeg`;
    const ref = this.storage.ref(refUrl);

    if(!registerPage){
      await ref.putString(photo, 'data_url').then(resp=>{
        this.firestore.collection("users").doc(user.id).update({
          imageUrl:refUrl,
        }).catch(error=>{
          console.log(error);
        });
      });
    }

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
