import { IUserData } from './../../interfaces/user.interface';
import { IMessagesResp } from './../../interfaces/messagesResp.interface';
import { PerfilModalComponent } from './../../components/perfil-modal/perfil-modal.component';
import { Subscription, Subject } from 'rxjs';
import { ChatService } from './chat.service';
import { IMessage } from './../../interfaces/message.interface';
import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { MediaRecorderService } from './../../../services/media-recorder.service';
import { AngularFirestore, DocumentChange } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import * as firebase from 'firebase';
import { IonItemSliding, PopoverController, ModalController } from '@ionic/angular';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';
import { Capacitor } from '@capacitor/core';
import { IUser } from '../../interfaces/user.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy{

  idChat:string;
  mensajes:IMessage[]=[];
  userName:string='';
  showEmojiPicker:boolean=false;
  tooglePress:boolean=false;
  dbChat:ILocalForage;
  chat:IChat;
  dbMessages:ILocalForage;
  dbUsers:ILocalForage;
  mensajesSubscribe:Subscription;
  tiempoGrabacion:string='00:00';
  bucleTime:NodeJS.Timeout;
  cancelar:boolean=false;
  showScrollButton=false;
  routeQuery:Params;
  user:IUser;
  imgPath:string;
  showEmojiPickerCont:number=0;
  blockChat:boolean=false;
  posEmoji:number=0;
  resetPosEmoji:boolean=true;
  @ViewChild('content') content: HTMLElement;
  @ViewChild('sliding', { static: false }) sliding: IonItemSliding;

  miFormulario:FormGroup=this.fb.group({
    mensaje:['',[Validators.required,Validators.minLength(1)]]
  });

  mensaje:AbstractControl=this.miFormulario.get("mensaje");

  constructor(
    private fb:FormBuilder,
    private route:ActivatedRoute,
    private firestore:AngularFirestore,
    private popoverController: PopoverController,
    private mediaRecorderService:MediaRecorderService,
    private db:DbService,
    private chatService:ChatService,
    private modal:ModalController
  ) { }

  ngOnInit(){
    this.dbUsers=this.db.loadStore("users");
    this.idChat=this.route.snapshot.paramMap.get("id");
    this.dbChat=this.db.loadStore("chats");
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
              this.imgPath="assets/person.jpg";
            }
          });
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
          if(values.state===false){
            this.db.deleteMessage(values.id,this.idChat);
          }
        }
      }).then(()=>{
        this.mensajes=this.chatService.orderMessages(arrMessages);
        this.db.setItemChat(this.idChat,{...this.chat,newMessages:0});
      })
      .catch(error=>console.log(error));

      if(this.db.messagesSubscriptions){
        const messages=this.db.messagesSubscriptions[this.idChat] as Subject<IMessagesResp>
        this.mensajesSubscribe=messages.subscribe(messagesResp=>{

          if(messagesResp.status===0){
            console.log("f")
            for (let i = this.mensajes.length -1; i > 0; i--){
              const message=this.mensajes[i];
              if(message.user!==this.userName){
                console.log(message.state)
                if(this.mensajes[i].state===false){
                  this.mensajes[i].state=true;
                  this.dbMessages.setItem(message.id,{
                    ...this.mensajes[i],
                    state:true
                  }).catch(error=>console.log(error));
                }else{
                  break;
                }
              }
            }
          }else if(messagesResp.status===1){
            messagesResp.resp.forEach(message=>{
              if(message.user!==this.userName){
                this.dbChat.getItem(this.idChat)
                .then(chat=>{
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
          }else if(messagesResp.status===1){
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
                    if(this.mensajes[i].state===false){
                      this.mensajes[i].state=true;
                      this.dbMessages.setItem(message.id,{
                        ...this.mensajes[i],
                        state:true
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
      }
    }).catch(err=>console.log(err));

    const ref=this.firestore.collection("messages")
    .doc(this.idChat).collection<IMessage>("messages")
    .ref;
  }

  ngOnDestroy(){
    if(this.mensajesSubscribe){
      this.mensajesSubscribe.unsubscribe();
    }
  }

  agregarMensaje(){
    const message=this.mensaje.value;
    this.chatService.addMessageInFirebase(message,this.idChat,this.userName,this.user);
    this.mensaje.setValue('');
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverChatComponent,
      componentProps:{
        "id":this.idChat,
        "contactName":this.user.data.userName
      },
      event: ev
    });
    return await popover.present();
  }

  addEmoji(event:any) {
    const textArea=document.querySelector(".native-textarea") as HTMLInputElement;
    let end = textArea.selectionEnd;
    if(this.resetPosEmoji){
      this.posEmoji=end;
    }else{
      this.posEmoji+=2;
      end=this.posEmoji;
    }
    this.resetPosEmoji=false;
    this.mensaje.setValue(this.mensaje.value.substr(0,end)+event.data+this.mensaje.value.substr(end));
  }

  toogleEmojiPicker(){
    this.showEmojiPicker=!this.showEmojiPicker;
    this.showEmojiPickerCont++;
  }

  recorder(){
    this.tooglePress=true;
    this.cancelar=false;
    this.mediaRecorderService.recorder();
    let seconds=0;

    this.bucleTime=setInterval(()=>{
      seconds++;
      let minute:string | number = Math.floor((seconds / 60) % 60);
      minute = (minute < 10)? '0' + minute : minute;
      let second:string | number = seconds % 60;
      second = (second < 10)? '0' + second : second;
      this.tiempoGrabacion=minute + ':' + second;
    }
    ,1000);
  }

  stop(){
    this.tooglePress=false;
    this.sliding.close();
    this.mediaRecorderService.stop(this.tiempoGrabacion,this.userName,this.idChat,this.cancelar);
    this.tiempoGrabacion='00:00';
    clearInterval(this.bucleTime);
  }

  public handleSlide(event: any): void {
    if(event.detail.ratio>=1 && this.tooglePress || event.detail.ratio==1){
      this.cancelar=true;
      this.stop();
    }
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
        idChat:this.idChat
      }
    }).then(modal=>modal.present());
  }
}
