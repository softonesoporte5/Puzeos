import { IUserData } from './../../interfaces/user.interface';
import { IMessagesResp } from './../../interfaces/messagesResp.interface';
import { PerfilModalComponent } from './../../components/perfil-modal/perfil-modal.component';
import { Subscription, Subject } from 'rxjs';
import { ChatService } from './chat.service';
import { IMessage } from './../../interfaces/message.interface';
import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import * as firebase from 'firebase';
import { PopoverController, ModalController, IonInfiniteScroll, IonContent } from '@ionic/angular';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';
import { Capacitor } from '@capacitor/core';
import { IUser } from '../../interfaces/user.interface';
import { StoreNames } from 'src/app/enums/store-names.enum';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy, AfterViewInit{

  idChat:string;
  allMessages:IMessage[]=[];
  userName:string='';
  dbChat:ILocalForage;
  chat:IChat;
  dbMessages:ILocalForage;
  dbUsers:ILocalForage;
  mensajes:IMessage[]=[];
  mensajesSubscribe:Subscription;
  scrollReplySubscribe:Subscription;
  stateSubscription: Subscription;
  showScrollButton=false;
  routeQuery:Params;
  user:IUser;
  imgPath:string;
  blockChat:boolean=false;
  syncInterval:NodeJS.Timeout;
  @ViewChild('content') content: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  posM=0;
  state:{online:boolean,last_changed:any};

  constructor(
    private route:ActivatedRoute,
    private firestore:AngularFirestore,
    private popoverController: PopoverController,
    private db:DbService,
    private chatService:ChatService,
    private modal:ModalController,
    private ngZone:NgZone
  ) { }

  ngOnInit(){
    this.dbUsers=this.db.loadStore(StoreNames.Users);
    this.idChat=this.route.snapshot.paramMap.get("id");
    this.dbChat=this.db.loadStore(StoreNames.Chats);
    this.dbMessages=this.db.loadStore("messages"+this.idChat);

    this.route.queryParams
    .subscribe(params => {
      this.routeQuery=params;
    });

    this.dbChat.getItem(this.idChat)
    .then((chat:IChat)=>{
      this.chat=chat;
      if(chat.deleted){
        this.blockChat=true;
      }

      for (const key in chat.members) {
        if(firebase.default.auth().currentUser.uid!==key){
          this.dbUsers.getItem(key)
          .then((user:IUserData)=>{
            this.user={id:key,data:user};
            if(this.user.data.imageUrlLoc){
              this.imgPath=Capacitor.convertFileSrc(this.user.data.imageUrlLoc);
            }else{
              this.imgPath='assets/avatar/avatar_'+user.avatarId+'.jpg'
            }
          });

          this.stateSubscription=this.firestore.collection("users").doc(key).valueChanges()
          .subscribe((resp:IUserData)=>{
            if(resp.online || resp.last_changed){
              this.state={
                online:resp.online,
                last_changed:resp.last_changed.toDate()
              }

            }
          })
        }
      }
    }).catch(err=>console.log(err));

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.userName=user.userName;
      let arrMessages=[];
      //Obtenemos los messages de la DB local
      this.dbMessages.iterate((values:IMessage)=>{
        arrMessages.push(values);
        if(values.user!==this.userName){
          if(values.state===1){
            this.db.deleteMessage(values.id,this.idChat);
          }
        }
      }).then(()=>{
        if(!this.routeQuery.id){
          this.mensajes=this.chatService.orderMessages(arrMessages);
        }else{
          if(arrMessages.length>19){
            this.allMessages=this.chatService.orderMessages(arrMessages);
            this.posM=this.allMessages.length;
            this.mensajes=this.allMessages.slice(this.posM-19, this.posM);
            this.posM-=19;
          }else{
            this.mensajes=this.chatService.orderMessages(arrMessages);
          }
        }
        this.db.setItemChat(this.idChat,{
          ...this.chat,
          newMessages:0
        });
        this.db.newMessages[this.idChat]=0;
      })
      .catch(error=>console.log(error));

      if(this.db.messagesSubscriptions){
        try{
          const messages=this.db.messagesSubscriptions[this.idChat] as Subject<IMessagesResp>;
          this.subscribeMessages(messages);
        }catch(e){
          let mInterval=setInterval(()=>{
            let messagesCon;
            console.log(messagesCon)
            if(messagesCon){
              clearInterval(mInterval);
            }else{
              messagesCon=this.db.messagesSubscriptions[this.idChat] as Subject<IMessagesResp>;
              this.subscribeMessages(messagesCon);
            }
          },2000);
        }
      }
    }).catch(err=>console.log(err));

    this.scrollReplySubscribe=this.chatService.scrollReply$.subscribe(resp=>{
      if(this.allMessages.length>0){
        this.allMessages.find((message,index)=>{
          if(message.id===resp){
            if(this.mensajes.length>=this.allMessages.length-index){
              const replyMessage:Element=document.querySelector("#"+resp);
              replyMessage.scrollIntoView();
              replyMessage.parentElement.animate([
                {backgroundColor: "#87bcf3b8"},
                {backgroundColor: "#87bcf300"}
              ],{
                duration:3000,
                easing:"ease-out"
              })

            }else{
              let rest=this.allMessages.length-this.mensajes.length-index;
              this.mensajes.unshift(...this.allMessages.slice(index, this.allMessages.length-this.mensajes.length));
              this.posM-=rest;
              setTimeout(()=>{
                const replyMessage:Element=document.querySelector("#"+resp);
                replyMessage.scrollIntoView();
                replyMessage.parentElement.animate([
                  {backgroundColor: "#87bcf3b8"},
                  {backgroundColor: "#87bcf300"}
                ],{
                  duration:3000,
                  easing:"ease-out"
                })
              },220);
            }
            return;
          }
        });
      }else{
        this.mensajes.find((message)=>{
          if(message.id===resp){
            const replyMessage:Element=document.querySelector("#"+resp);
              replyMessage.scrollIntoView();
              replyMessage.parentElement.animate([
                {backgroundColor: "#87bcf3b8"},
                {backgroundColor: "#87bcf300"}
              ],{
                duration:3000,
                easing:"ease-out"
              });
            return;
          }
        });
      }
    });

    this.ngZone.runOutsideAngular(()=>{
      this.syncInterval=setInterval(()=>{
        if(!this.db.sync){
          this.db.syncMessages();
        }
      },5000);
    });

    const ref=this.firestore.collection("messages")
    .doc(this.idChat).collection<IMessage>("messages")
    .ref;
  }

  ngAfterViewInit(){
    this.content.getScrollElement()
    .then(resp=>{
      resp.addEventListener("scroll",e=>this.scrollEvent(e));
    });
  }

  ngOnDestroy(){
    if(this.mensajesSubscribe){
      this.mensajesSubscribe.unsubscribe();
    }
    if(this.scrollReplySubscribe){
      this.scrollReplySubscribe.unsubscribe();
    }
    if(this.stateSubscription){
      this.stateSubscription.unsubscribe();
    }
    if(this.syncInterval){
      clearInterval(this.syncInterval);
    }
  }

  subscribeMessages(messages:Subject<IMessagesResp>){
    this.mensajesSubscribe=messages.subscribe(messagesResp=>{
      this.ngZone.run(()=>{
        if(messagesResp.status===0){//Si no llega ningun mensaje
          for (let i = this.mensajes.length -1; i > 0; i--){
            const message=this.mensajes[i];
            if(message.user!==this.userName){
              if(this.mensajes[i].state===1){
                this.mensajes[i].state=2;
                this.dbMessages.setItem(message.id,{
                  ...this.mensajes[i],
                  state:2
                }).catch(error=>console.log(error));
              }else{
                break;
              }
            }
          }
        }else if(messagesResp.status===1){//Cuando se agrega un mensaje con state 0
          messagesResp.resp.forEach(message=>{
            if(message.user!==this.userName){
              this.dbChat.getItem(this.idChat)
              .then(chat=>{
                console.log("asd")
                this.db.setItemChat(this.idChat,{...chat,newMessages:0});
              },err=>console.log(err));
              this.db.deleteMessage(message.id,this.idChat);
            }else{
              const audio=document.querySelector(".sendMessageSound") as HTMLMediaElement;
              audio.play();
            }
          });
          if(messagesResp.resp.length>1){
            const orderResp=this.chatService.orderMessages(messagesResp.resp);
            Array.prototype.push.apply(this.mensajes,orderResp);
          }else{
            Array.prototype.push.apply(this.mensajes,messagesResp.resp);
          }
        }else if(messagesResp.status===5){//Cuando se agrega un mensaje nuevo
          messagesResp.resp.forEach(message=>{
            if(message.idChat && message.user===this.userName){
              let index=this.mensajes.findIndex(mensaje=>mensaje.id===message.id);
              this.mensajes.splice(index, 1);
            }else{
              if(message.user!==this.userName){
                this.dbChat.getItem(this.idChat)
                .then(chat=>{
                  this.db.setItemChat(this.idChat,{
                    ...chat,
                    lastMessage:message.message,
                    newMessages:0
                  });
                },err=>console.log(err));
                this.db.deleteMessage(message.id,this.idChat);
              }else{
                const audio=document.querySelector(".sendMessageSound") as HTMLMediaElement;
                audio.play();
              }
            }
          });
          if(messagesResp.resp.length>1){
            const orderResp=this.chatService.orderMessages(messagesResp.resp);
            Array.prototype.push.apply(this.mensajes,orderResp);
          }else{
            Array.prototype.push.apply(this.mensajes,messagesResp.resp);
          }
        }else if(messagesResp.status===4){
          this.blockChat=true;
        }else{
          console.log(messagesResp.resp)
          messagesResp.resp.forEach(message=>{
            if(message.user===this.userName){
              let deletePer=false;
              for (let i = this.mensajes.length -1; i > 0; i--){
                if(this.mensajes[i].id===message.id){
                  deletePer=true;
                }
                if(deletePer===true){
                  if(this.mensajes[i].state===1){
                    this.mensajes[i].state=2;
                    this.dbMessages.setItem(message.id,{
                      ...this.mensajes[i],
                      state:2
                    }).then(resp=>console.log(resp))
                    .catch(error=>console.log(error));
                    break;
                  }else{
                    deletePer=false;
                    break;
                  }
                }
              }
            }
          });
        }
      })
    })
  }

  loadData(event) {
    if(this.posM-19<0){
      this.mensajes.unshift(...this.allMessages.slice(0, this.posM));
    }else{
      this.mensajes.unshift(...this.allMessages.slice(this.posM-19, this.posM));
    }
    this.posM-=19;
    console.log("Se agregaron nuevos mensajes")
    event.target.complete();

    if (this.posM <= 0) {
      event.target.disabled = true;
    }
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverChatComponent,
      componentProps:{
        "id":this.idChat,
        "contactName":this.user.data.userName,
        "contactID":this.user.id
      },
      event: ev
    });
    return await popover.present();
  }

  trackByFn(index:number, item:IMessage){
    return item.id;
  }

  scrollEvent(e:any){
    if(e.target.scrollHeight-e.target.offsetHeight-e.target.scrollTop>300){
      if(this.showScrollButton!==true) this.showScrollButton=true;
    }else{
      if(this.showScrollButton===true) this.showScrollButton=false;
    }
  }

  openModal(){
    this.modal.create({
      component:PerfilModalComponent,
      componentProps:{
        user:this.user,
        chat:this.chat,
      }
    }).then(modal=>modal.present());
  }
}
