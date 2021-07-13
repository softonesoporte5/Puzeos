import { ChatService } from './../chat/pages/chat/chat.service';
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
  private messagesSubscriptions$:Subject<IMessage[] | IMessage>[]=[];
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
            this.dbMessages[chatID]=this.loadStore("messages"+chatID);

            this.messagesSubscriptions$[chatID]=new Subject<IMessage[] | IMessage>();
            this.arrMessages[chatID]=[];

            const ref=this.firestore.collection("messages")
            .doc(chatID).collection<IMessage>("messages")
            .ref;

            ref.onSnapshot(resp=>{
              let arrMensajes:IMessage[]=[];
              const datos=resp.docChanges();

              datos.forEach((mensaje,index)=>{
                if(mensaje.type!=='removed'){
                  if(!mensaje.doc.metadata.hasPendingWrites){//Comprobar si los datos vienen del servidor
                    this.dbMessages[chatID].getItem(mensaje.doc.id)
                    .then(resp=>{
                      if(!resp){
                        const data=mensaje.doc.data() as IMessage;

                        const message={
                          ...data,
                          id:mensaje.doc.id,
                          download:false,
                          timestamp:data.timestamp.toDate(),
                          state:false
                        };

                        arrMensajes.push(message);
                        //Agregamos a la DB Local y lo eliminamos de Firebase si no lo envió el ususario
                        this.addMessage(message,chatID,this.dbChats, this.dbMessages[chatID]);
                        if(data.user!==this.user.userName){
                          //this.newMessages++;
                        }
                        //Agregamos todos los mensajes cuando se procese el último
                        if(index===datos.length-1){
                          Array.prototype.push.apply(this.arrMessages[chatID],arrMensajes);
                          console.log(index);
                          this.messagesSubscriptions$[chatID].next([...arrMensajes]);
                        }
                      }
                    }).catch(err=>console.log(err));
                  }
                }else{
                  let deletePer=false;
                  for (let i = this.arrMessages[chatID].length -1; i > 0; i--){
                    if(this.arrMessages[chatID][i].id===mensaje.doc.id){
                      deletePer=true;
                    }
                    if(deletePer===true){
                      if(this.arrMessages[chatID][i].state===false){
                        this.arrMessages[chatID][i].state=true;

                        this.dbMessages[chatID].setItem(mensaje.doc.id,{
                          id:mensaje.doc.id,
                          ...mensaje.doc.data(),
                          timestamp:mensaje.doc.data().timestamp.toDate(),
                          state:true
                        }).catch(error=>console.log(error));
                        break;
                      }else{
                        deletePer=false;
                        break;
                      }
                    }
                  }
                }

                /*if(datos.length-1===index){
                  this.dbChats.getItem(chatID)
                  .then(resp=>{
                    if(resp){
                      console.log("a")
                      this.setItemChat(chatID,{
                        ...resp
                        //newMessages:this.newMessages
                      });
                    }
                  })

                }*/
              })
            });
            this.messagesSubscriptions[chatID]=this.messagesSubscriptions$[chatID].asObservable();
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

  addMessage(message:IMessage,idChat:string,dbChat:ILocalForage,dbMessages:ILocalForage){
    if(message.user!==this.user.userName){
      this.firestore.collection("messages").doc(idChat)
      .collection("messages").doc(message.id)
      .delete()
      .catch(error=>{
        console.log(error);
      });
    }

    dbChat.getItem(idChat)
    .then((resp:IChat)=>{
      if(resp){

        this.setItemChat(idChat,{
          ...resp,
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
