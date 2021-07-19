import { IMessagesResp } from './../chat/interfaces/messagesResp.interface';
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

  messagesSubscriptions:{};
  private messagesSubscriptionsObject$=new Subject<{}>();
  private messagesSubscriptions$:Subject<IMessagesResp>[]=[];
  private dbChats$=new Subject<IChat[] | IChat>();
  chats:IChat[]=[];
  private dbChats:ILocalForage;
  private dbUsers:ILocalForage;
  user:IUserData;
  arrMessages={};
  dbMessages:ILocalForage[]=[];

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
            this.addNewConecction(chatID,index);
          });
        }
      },err=>console.log(err));
    }
  }

  addNewConecction(chatID:string,index:number){
    this.dbMessages[chatID]=this.loadStore("messages"+chatID);
    this.messagesSubscriptions$[chatID]=new Subject<IMessage[] | IMessage>();
    this.arrMessages[chatID]=[];

    const ref=this.firestore.collection("messages")
    .doc(chatID).collection<IMessage>("messages")
    .ref;
    ref.onSnapshot(resp=>{
      let arrMensajes:IMessage[]=[];
      const datos=resp.docChanges();
      if(datos.length===0){
        this.messagesSubscriptions$[chatID].next({resp:[],status:0});
      }

      datos.forEach((mensaje,index)=>{
        if(mensaje.type!=='removed'){
          if(!mensaje.doc.metadata.hasPendingWrites){//Comprobar si los datos vienen del servidor
            //console.log(mensaje.type)
            this.dbMessages[chatID].getItem(mensaje.doc.id)
            .then(resp=>{
              if(!resp){
                const data=mensaje.doc.data() as IMessage;
                if(data.type==="delete"){
                  console.log(data);
                  this.dbChats.getItem(chatID)
                  .then(chat=>{
                    console.log(chat)
                    this.dbChats.setItem(chatID,{
                      ...chat,
                      deleted:true
                    }).then(()=>{
                      console.log("df")
                      this.messagesSubscriptions$[chatID].next({resp:[],status:4});
                    })
                  })
                }else{
                  const message={
                    ...data,
                    id:mensaje.doc.id,
                    download:false,
                    timestamp:data.timestamp.toDate(),
                    state:false
                  };

                  if(data.user===this.user.userName){
                    message.download=true;
                  }

                  arrMensajes.push(message);
                  //Agregamos a la DB Local
                  this.addMessage(message,chatID,this.dbChats, this.dbMessages[chatID]);
                  if(data.user!==this.user.userName){
                  }
                  //Agregamos todos los mensajes cuando se procese el último
                  if(index===datos.length-1){
                    Array.prototype.push.apply(this.arrMessages[chatID],arrMensajes);
                    this.messagesSubscriptions$[chatID].next({resp:[...arrMensajes],status:1});
                  }
                }
              }
            }).catch(err=>console.log(err));
          }
        }else{
          const data=mensaje.doc.data() as IMessage;
          this.messagesSubscriptions$[chatID].next({resp:[{...data,id:mensaje.doc.id}],status:2});

          this.dbMessages[chatID].getItem(mensaje.doc.id)
          .then((resp:IMessage)=>{
            this.dbMessages[chatID].setItem(mensaje.doc.id,{
              ...resp,
              state:true
            }).then((resp:any)=>console.log(resp))
            .catch((error:any)=>console.log(error));
          },(err:any)=>console.log(err))

        }
      })
    });
    this.messagesSubscriptions[chatID]=this.messagesSubscriptions$[chatID].asObservable();
    if(index+1===this.user.chats.length){
      this.messagesSubscriptionsObject$.next(this.messagesSubscriptions);
    }
  }

  loadStore(name: string){
    return localForage.createInstance({
      name        : localForage._config.name,
      storeName   : name
    });
  }

  deleteMessage(messageID:string,idChat:string){

    this.firestore.collection("messages").doc(idChat)
      .collection("messages").doc(messageID)
      .delete()
      .catch(error=>{
        console.log(error);
      });
  }

  addMessage(message:IMessage,idChat:string,dbChat:ILocalForage,dbMessages:ILocalForage){
    dbChat.getItem(idChat)
    .then((resp:IChat)=>{
      if(resp){
        if(message.user!==this.user.userName){
          if(resp.newMessages){
            resp.newMessages++;
          }else{
            resp.newMessages=1;
          }
        }
        this.setItemChat(idChat,{
          ...resp,
          newMessages:resp.newMessages,
          lastMessage:message.message,
          timestamp:message.timestamp,
        });
      }
    })

    dbMessages.setItem(message.id,message)
    .catch(error=>console.log(error));
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
