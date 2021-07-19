import { IUser } from './../../interfaces/user.interface';
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

  addMessageInFirebase(message:string,idChat:string,userName:string,sendUser:IUser){
    const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();
    this.firestore.collection("messages").doc(idChat).collection("messages").add({
      message:message,
      user:userName,
      type:"text",
      sendToToken:sendUser.data.token,
      toUserId:sendUser.id,
      timestamp:timestamp
    }).catch(error=>{
      console.log(error);
    });
  }

  setLastDate(date:Date){
    this.lastDate=date;
  }
}

