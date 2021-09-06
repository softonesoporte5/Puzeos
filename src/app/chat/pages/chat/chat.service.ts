import { Subject } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { AppService } from './../../../app.service';
import { IUser } from './../../interfaces/user.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IMessage } from './../../interfaces/message.interface';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { StoreNames } from 'src/app/enums/store-names.enum';

@Injectable({
  providedIn: 'root'
})
export class ChatService{

  userName:string;
  idChat:string;
  dbNotSendMessages:ILocalForage;
  lastDate:Date;
  networkStatus:boolean=true;
  replyMessage$=new Subject<IMessage>();
  scrollReply$=new Subject<string>();

  constructor(
    private appService:AppService,
    private firestore:AngularFirestore,
    private db:DbService
  ) {
    this.appService.getNetworkStatus()
    .subscribe(resp=>{
      this.networkStatus=resp;
    });

    this.dbNotSendMessages=this.db.loadStore(StoreNames.NotSendMessage);
   }

  orderMessages(mesagges:IMessage[]){
    mesagges=mesagges.sort(function (a, b) {
      if (a.timestamp.valueOf() > b.timestamp.valueOf()) {
        return 1;
      }
      if (a.timestamp.valueOf() < b.timestamp.valueOf()) {
        return -1;
      }
      return 0;
    });
    return mesagges;
  }

  addMessageInFirebase(message:string,idChat:string,userName:string,sendUser:IUser, replyMessage?:IMessage){
    if(this.networkStatus){
      const dbMessage=this.db.loadStore("messages"+idChat);
      const id="a"+new Date().getTime()+''+Math.round(Math.random()*10000);
      const newMessage={
        message:message,
        user:userName,
        type:"text",
        sendToToken:sendUser.data.token || "",
        toUserId:sendUser.id,
        timestamp:new Date(),
        state:0,
        id:id,
        idChat:idChat,
        download:true
      }
      if(replyMessage){
        newMessage["reply"]=replyMessage;
      }

      dbMessage.setItem(id,newMessage);

      this.dbNotSendMessages.setItem(id,newMessage).then(resp=>{
        Array.prototype.push.apply(this.db.arrMessages[idChat],[resp]);
        this.db.messagesSubscriptions$[idChat].next({resp:[...[resp]],status:1});
      });

      const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();
      this.firestore.collection("messages").doc(idChat).collection("messages").doc(id).set({
        ...newMessage,
        state:1,
        timestamp:timestamp
      })
      .then(()=>{
        this.dbNotSendMessages.removeItem(id);
      }).catch(error=>{
        console.log(error);
      });
    }else{
      const dbMessage=this.db.loadStore("messages"+idChat);
      const id="a"+new Date().getTime()+''+Math.round(Math.random()*10000);

      const newMessage={
        message:message,
        user:userName,
        type:"text",
        sendToToken:sendUser.data.token || "",
        toUserId:sendUser.id,
        timestamp:new Date(),
        state:0,
        id:id,
        idChat:idChat,
        download:true
      };

      if(replyMessage){
        newMessage["reply"]=replyMessage;
      }

      dbMessage.setItem(id,newMessage);

      this.dbNotSendMessages.setItem(id,newMessage).then(resp=>{
        Array.prototype.push.apply(this.db.arrMessages[idChat],[resp]);
        this.db.messagesSubscriptions$[idChat].next({resp:[...[resp]],status:1});
      });
    }
  }

  setLastDate(date:Date){
    this.lastDate=date;
  }

}

