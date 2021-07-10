import { AngularFirestore, DocumentChange } from '@angular/fire/firestore';
import { IUserData } from './../chat/interfaces/user.interface';
import { IMessage } from './../chat/interfaces/message.interface';
import { IChat } from './../chat/interfaces/chat.interface';
import { Subject } from 'rxjs';
import { ILocalForage } from './../chat/interfaces/localForage.interface';
import { Injectable } from '@angular/core';
const localForage = require("localforage") as ILocalForage;
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class DbService{

  messagesSubscriptions;
  private messagesSubscriptionsObject$=new Subject<{}>();
  private messagesSubscriptions$:Subject<DocumentChange<IMessage>[] | DocumentChange<IMessage>>[]=[];
  private dbChats$=new Subject<IChat[] | IChat>();
  chats:IChat[]=[];
  private dbChats:ILocalForage;
  private dbUsers:ILocalForage;
  user:IUserData;

  constructor(
    private firestore:AngularFirestore
  ) {
    this.dbChats=this.loadStore("chats");
    this.dbUsers=this.loadStore("users");

    if(firebase.default.auth().currentUser?.uid){
      this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
      .then((user:IUserData)=>{
        if(user){
          this.user=user;

          //Creamos las conexiones locales y de firebase para cada chat
          this.messagesSubscriptions={}
          this.user.chats.forEach((chatID,index)=>{
            this.messagesSubscriptions$[index]=new Subject<DocumentChange<IMessage>[] | DocumentChange<IMessage>>();

            const ref=this.firestore.collection("messages")
            .doc(chatID).collection<IMessage>("messages")
            .ref;

            ref.onSnapshot(resp=>{
              this.messagesSubscriptions$[index].next(resp.docChanges());
            });
            this.messagesSubscriptions[chatID]=this.messagesSubscriptions$[index].asObservable();
            if(index+1===this.user.chats.length){
              this.messagesSubscriptionsObject$.next(this.messagesSubscriptions);
            }
          });
        }
      },err=>console.log(err));
    }
  }

  loadStore(name: string){
    return localForage.createInstance({
      name        : localForage._config.name,
      storeName   : name
    });
  }

  getMessagesSubscriptions(){
    return this.messagesSubscriptionsObject$.asObservable();
  }

  setItemChat(idChat:string,value:IChat){
    this.dbChats.setItem(idChat,value)
    .then((resp)=>{
      this.dbChats$.next({...resp,id:idChat})
    })
    .catch(err=>console.log(err));
  }

  getItemsChat(){
    return this.dbChats$.asObservable() ;
  }

  cargarItemsChat(){
    this.dbChats.iterate(chat=>{
      this.chats.push(chat);
    }).then(()=>this.dbChats$.next(this.chats))
    .catch(err=>console.log(err));
  }
}
