import { ILocalForage } from './../chat/interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { AppService } from './../app.service';
import { IAudioBlob } from './../chat/interfaces/audioBlob.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { IUser } from '../chat/interfaces/user.interface';
import { StoreNames } from '../enums/store-names.enum';

@Injectable({
  providedIn: 'root'
})

export class FirebaseStorageService {

  networkState:boolean;
  dbNotSendMessages:ILocalForage;
  uploads={};

  constructor(
    private storage:AngularFireStorage,
    private firestore:AngularFirestore,
    private appService:AppService,
    private db:DbService
  ) {
    this.appService.getNetworkStatus()
    .subscribe(resp=>this.networkState=resp);
    this.dbNotSendMessages=this.db.loadStore(StoreNames.NotSendMessage);
  }

  uploadAudio(audio:IAudioBlob,userName:string,idChat:string,localUrl:string){
    const date=new Date().valueOf();
    const randomId="a"+Math.round(Math.random()*1000)+''+date;
    const refUrl=`${idChat}/audios/${randomId}.mp3`;
    console.log(localUrl)
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
        console.log("Error al subir audio "+error);
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

  async uploadFile(data:string,userName:string, type:string, localUrl:string, idChat:string, extraData:{}={},ext:string, messageTxt:string){
    const date=new Date().valueOf();
    const randomId="a"+Math.round(Math.random()*1000)+''+date;
    const refUrl=`${idChat}/send/${randomId}.${ext}`;

    let base64Length = data.length - (data.indexOf(',') + 1);
    let padding = (data.charAt(data.length - 2) === '=') ? 2 : ((data.charAt(data.length - 1) === '=') ? 1 : 0);
    let fileSize = base64Length * 0.75 - padding;

    if(this.networkState){
      const ref = this.storage.ref(refUrl);

      let upload=ref.putString(data, 'data_url');
      this.uploads[randomId]=upload;

      this.uploads[randomId].then(()=>{
        this.firestore.collection("messages").doc(idChat).collection("messages").doc(randomId).set({
          message:messageTxt,
          ref:refUrl,
          user:userName,
          type:type,
          size:fileSize,
          idChat:idChat,
          download:false,
          id:randomId,
          localRef:localUrl,
          ...extraData,
          state:1,
          timestamp:firebase.default.firestore.FieldValue.serverTimestamp()
        }).catch(error=>{
          console.log(error);
        });
      }).catch(error=>{
        console.log("Error al subir archivo",error);
      });

      const dbMessage=this.db.loadStore("messages"+idChat);

      const newMessage={
        message:messageTxt,
        ref:refUrl,
        user:userName,
        type:type,
        size:fileSize,
        idChat:idChat,
        id:randomId,
        timestamp:new Date(),
        state:0,
        localRef:localUrl,
        ...extraData
      };

      dbMessage.setItem(randomId,newMessage);

      Array.prototype.push.apply(this.db.arrMessages[idChat],[newMessage]);
      this.db.messagesSubscriptions$[idChat].next({resp:[...[newMessage]],status:1});

    }else{
      const dbMessage=this.db.loadStore("messages"+idChat);

      const newMessage={
        message:messageTxt,
        ref:refUrl,
        user:userName,
        type:type,
        size:fileSize,
        idChat:idChat,
        download:false,
        id:randomId,
        timestamp:new Date(),
        state:0,
        localRef:localUrl,
        ...extraData
      };

      dbMessage.setItem(randomId,newMessage);

      Array.prototype.push.apply(this.db.arrMessages[idChat],[newMessage]);
      this.db.messagesSubscriptions$[idChat].next({resp:[...[newMessage]],status:1});
    }
  }

  async uploadPhoto(photo:string, user:IUser, localUrl?:string, registerPage:boolean=false){
    const date=new Date().valueOf();
    const randomId="a"+Math.round(Math.random()*1000)+date;
    const refUrl=`${user.id}/images/${randomId}.jpeg`;
    const ref = this.storage.ref(refUrl);

    if(!registerPage){
      await ref.putString(photo, 'data_url').then(()=>{
        this.firestore.collection("users").doc(user.id).update({
          imageUrl:refUrl,
          imageUrlLoc:localUrl
        }).catch(error=>{
          console.log(error);
        });
      }).catch(err=>console.log(err))
    }else{
      await ref.putString(photo, 'data_url');
    }

    return refUrl;
  }


  getUrlFile(url:string){
    return this.storage.ref(url).getDownloadURL();
  }
}
