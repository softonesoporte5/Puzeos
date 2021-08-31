import { AppService } from './../app.service';
import { IMessagesResp } from './../chat/interfaces/messagesResp.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUserData } from './../chat/interfaces/user.interface';
import { IMessage } from './../chat/interfaces/message.interface';
import { IChat } from './../chat/interfaces/chat.interface';
import { Subject, Observable } from 'rxjs';
import { ILocalForage } from './../chat/interfaces/localForage.interface';
import { Injectable } from '@angular/core';
const localForage = require("localforage") as ILocalForage;
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class DbService{

  messagesSubscriptions:{}={};
  private messagesSubscriptionsObject$=new Subject<{}>();
  messagesSubscriptions$:Subject<IMessagesResp>[]=[];
  private dbChats$=new Subject<IChat[] | IChat>();
  chats:IChat[]=[];
  private dbChats:ILocalForage;
  private dbUsers:ILocalForage;
  sync=false;
  user:IUserData;
  arrMessages={};
  dbMessages:ILocalForage[]=[];
  dbNotSendMessages:ILocalForage;

  constructor(
    private firestore:AngularFirestore,
    private appService:AppService,
  ) {
    this.dbChats=this.loadStore("chats");
    this.dbUsers=this.loadStore("users");
    this.dbNotSendMessages=this.loadStore("notSendMessage");
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

      this.obtenerUsuario()
      .subscribe(user=>{
        if(user.imageUrl){
          this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
          .then((userData:IUserData)=>{
            this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
              ...user,
              imageUrlLoc:userData.imageUrlLoc
            });
          });
        }else{
          this.dbUsers.setItem(firebase.default.auth().currentUser.uid,user);
        }
      });
    }

    this.appService.getNetworkStatus()
    .subscribe(()=>{
      this.syncMessages();
    });
  }

  addNewConecction(chatID:string,index:number){
    this.dbMessages[chatID]=this.loadStore("messages"+chatID);
    this.messagesSubscriptions$[chatID]=new Subject<IMessage[] | IMessage>();
    this.arrMessages[chatID]=[];

    const actions=()=>{
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
              const data=mensaje.doc.data();
              this.dbMessages[chatID].getItem(mensaje.doc.id)
              .then((resp:IMessage)=>{
                if(!resp){
                  if(data.type==="delete" || data.type==="deleteAndBlock"){
                    this.dbChats.getItem(chatID)
                    .then(chat=>{
                      this.dbChats.setItem(chatID,{
                        ...chat,
                        deleted:true
                      }).then(()=>{
                        if(data.type==="deleteAndBlock"){
                          this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
                          .then((resp:IUserData)=>{
                            if(!resp.notAddUsers) resp.notAddUsers={};
                            resp.notAddUsers[data.specialData.id]=data.specialData.userName;
                            this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid).update({
                              notAddUsers:resp.notAddUsers
                            }).then(()=>{
                              this.messagesSubscriptions$[chatID].next({resp:[],status:4});
                            }).catch(error=> console.log(error));
                          });
                        }else{
                          this.messagesSubscriptions$[chatID].next({resp:[],status:4});
                        }
                      })
                    })
                  }else{
                    const message={
                      ...data,
                      id:mensaje.doc.id,
                      download:false,
                      timestamp:data.timestamp.toDate(),
                      state:1
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
                      this.messagesSubscriptions$[chatID].next({resp:[...arrMensajes],status:5});
                    }
                  }
                }else{
                  if(data.idChat){
                    const messageResp={
                      ...data,
                      id:mensaje.doc.id,
                      download:false,
                      timestamp:data.timestamp.toDate(),
                      state:1
                    };
                    delete data.idChat;
                    const message={
                      ...data,
                      id:mensaje.doc.id,
                      download:false,
                      timestamp:data.timestamp.toDate(),
                      state:1
                    };

                    if(data.user===this.user.userName){
                      message.download=true;
                    }

                    arrMensajes.push(messageResp);
                    this.addMessage({...message},chatID,this.dbChats, this.dbMessages[chatID]);
                    //Agregamos todos los mensajes cuando se procese el último
                    if(index===datos.length-1){
                      Array.prototype.push.apply(this.arrMessages[chatID],arrMensajes);
                      this.messagesSubscriptions$[chatID].next({resp:[...arrMensajes],status:5});
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
                state:2
              }).catch((error:any)=>console.log(error));
            },(err:any)=>console.log(err))

          }
        })
      });
      this.messagesSubscriptions[chatID]=this.messagesSubscriptions$[chatID].asObservable();
      if(index+1===this.user.chats.length){
        this.messagesSubscriptionsObject$.next(this.messagesSubscriptions);
      }
    }

    if(!this.user){
      this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
      .then((user:IUserData)=>{
        if(user){
          this.user=user;
          actions();
        }
      });
    }else{
      actions();
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

  syncMessages(){
    this.dbNotSendMessages.iterate((message:IMessage,key:string)=>{
      this.sync=true;
      if(message.type==="text"){
        const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();
        this.firestore.collection("messages").doc(message.idChat)
        .collection("messages")
        .doc(key)
        .set({
          ...message,
          sendToToken:message.sendToToken || "",
          timestamp:timestamp,
          state:1
        }).then(()=>{
          this.dbNotSendMessages.removeItem(key);
        }).catch(error=>{
          console.log(error);
        });
      }else if(message.type==="voice"){

        this.appService.reUloadAudio(message)
        .then(()=>{
          this.dbNotSendMessages.removeItem(key);
        },err=>{
          console.log(err);
          this.dbNotSendMessages.removeItem(key);
        })
      }
    }).then(()=>{
      this.sync=false;
    })
  }

  obtenerUsuario(){
    return this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid).valueChanges() as Observable<IUserData>;
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
