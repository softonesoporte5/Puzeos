import { IChat } from './../../interfaces/chat.interface';
import { DbService } from 'src/app/services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IMessage } from './../../interfaces/message.interface';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class ChatService{

  userName:string;
  idChat:string;
  dbChat:ILocalForage;
  lastDate:Date;

  constructor(
    private db:DbService,
    private firestore:AngularFirestore
  ) { }

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

  addMessage(message:IMessage,idChat:string,dbChat:ILocalForage,dbMessages:ILocalForage){
    if(message.user!==this.userName){
      this.firestore.collection("messages").doc(this.idChat)
      .collection("messages").doc(message.id)
      .delete()
      .catch(error=>{
        console.log(error);
      });
    }

    dbChat.getItem(idChat)
    .then((resp:IChat)=>{
      if(resp){

        this.db.setItemChat(idChat,{
          ...resp,
          lastMessage:message.message,
          timestamp:message.timestamp,
        });
      }
    })

    dbMessages.setItem(message.id,message)
    .catch(error=>console.log(error));
  }

  addMessageInFirebase(message:string,idChat:string,userName:string){
    const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();
    this.firestore.collection("messages").doc(idChat).collection("messages").add({
      message:message,
      user:userName,
      type:"text",
      timestamp:timestamp
    }).catch(error=>{
      console.log(error);
    });
  }

  setLastDate(date:Date){
    this.lastDate=date;
  }
}

