import { DbService } from 'src/app/services/db.service';
import { Subject } from 'rxjs';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IMessage } from './../../interfaces/message.interface';
import { Injectable, OnInit } from '@angular/core';
import { CollectionReference, AngularFirestore, DocumentChange } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnInit{

  private messages$=new Subject<DocumentChange<IMessage>[]>();
  dbMessages:ILocalForage;
  userName:string;
  idChat:string;

  constructor(
    private db:DbService,
    private firestore:AngularFirestore
  ) { }

  ngOnInit(){console.log("test")}

  subscribeMessages(ref:CollectionReference<IMessage>){
    ref.onSnapshot(resp=>{
      this.messages$.next(resp.docChanges());
    });
  }

  getMessages(ref:CollectionReference<IMessage>, idChat:string, userName:string){
    this.dbMessages=this.db.loadStore("messages"+idChat);
    this.idChat=idChat;
    this.userName=userName;
    this.subscribeMessages(ref);
    return this.messages$.asObservable();
  }

  orderMessages(mesagges:IMessage[]){
    let messageArr=[];

    mesagges.forEach(message=>{
      messageArr.push({...message,timestamp:message.timestamp.valueOf()});
    });

    messageArr=messageArr.sort(function (a, b) {
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      return 0;
    });

    return messageArr;
  }

  addMessage(message:IMessage){
    if(message.user!==this.userName){
      this.firestore.collection("messages").doc(this.idChat)
      .collection("messages").doc(message.id)
      .delete()
      .catch(error=>{
        console.log(error);
      });
    }

    this.dbMessages.setItem(message.id,message)
    .catch(error=>console.log(error));
  }

  addMessageInFirebase(message:string){
    const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();

    this.firestore.collection("messages").doc(this.idChat).collection("messages").add({
      message:message,
      user:this.userName,
      type:"text",
      timestamp:timestamp
    }).catch(error=>{
      console.log(error);
    });

    this.firestore.collection("chats").doc(this.idChat).update({//Agregar ultimo mensaje al chat
      lastMessage:`${message}`,
      timestamp:timestamp
    });
  }
}

