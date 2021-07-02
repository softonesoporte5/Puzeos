import { Subscription } from 'rxjs';
import { ChatService } from './chat.service';
import { IMessage } from './../../interfaces/message.interface';
import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { MediaRecorderService } from './../../../services/media-recorder.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { IonItemSliding, PopoverController } from '@ionic/angular';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy{

  idChat:string;
  mensajes:IMessage[]=[];
  userName:string='';
  contactName:string='';
  showEmojiPicker:boolean=false;
  tooglePress:boolean=false;
  progress=0;
  dbChat:ILocalForage;
  chat:IChat;
  dbMessages:ILocalForage;
  dbUsers:ILocalForage;
  mensajesSubscribe:Subscription;
  audioSubscribe:Subscription;
  tiempoGrabacion:string='00:00';
  bucleTime:NodeJS.Timeout;
  cancelar:boolean=false;
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
    private firebaseStorageService:FirebaseStorageService,
    private db:DbService,
    private chatService:ChatService
  ) { }

  ngOnInit(){
    this.dbUsers=this.db.loadStore("users");
    this.idChat=this.route.snapshot.paramMap.get("id");
    this.dbChat=this.db.loadStore("chats");
    this.dbMessages=this.db.loadStore("messages"+this.idChat);

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.userName=user.userName;

      let arrMessages=[];
      this.dbMessages.iterate((values)=>{
        arrMessages.push(values);
      }).then(()=>{
        this.mensajes=this.chatService.orderMessages(arrMessages);
      })
      .catch(error=>console.log(error));

      this.mensajesSubscribe=this.chatService.getMessages(ref, this.idChat, this.userName)
      .subscribe(messagesResp=>{
        //Comprobamos si los mensaje fueron visto y no se detectó
        if(messagesResp.length==0){
          for (let index = this.mensajes.length-1; index > 0; index--){
            const mensaje = this.mensajes[index];
            if(mensaje.user===this.userName){
              if(mensaje.state===false){
                this.dbMessages.setItem(mensaje.id,{
                  ...mensaje,
                  download:false,
                  state:true
                })
                .then(resp=>{
                  this.mensajes[index]=resp;
                })
                .catch(error=>console.log(error));
              }else{
                break;
              }
            }else{
              continue;
            }
          }
        }

        let arrMensajes:IMessage[]=[];
        messagesResp.forEach((mensaje,index)=>{
          arrMensajes=[];
          if(mensaje.type!=='removed'){
            if(!mensaje.doc.metadata.hasPendingWrites){//Comprobar si los datos vienen del servidor
              this.dbMessages.getItem(mensaje.doc.id)
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
                  this.chatService.addMessage(message,this.idChat);
                  //Agregamos todos los mensajes cuando se procese el último
                  if(index===messagesResp.length-1){
                    Array.prototype.push.apply(this.mensajes,arrMensajes)
                  }
                }
              }).catch(err=>console.log(err));
            }
          }else{
            for (let i = this.mensajes.length -1; i > 0; i--){
              if(this.mensajes[i].id===mensaje.doc.id){
                this.mensajes[i].state=true;

                this.dbMessages.setItem(mensaje.doc.id,{
                  id:mensaje.doc.id,
                  ...mensaje.doc.data(),
                  timestamp:mensaje.doc.data().timestamp.toDate(),
                  state:true
                }).catch(error=>console.log(error));
                break;
              }
            }
          }
        })
      });

      this.audioSubscribe=this.mediaRecorderService.audio$
      .subscribe(audio=>{
        if(!this.cancelar){
          this.firebaseStorageService.uploadAudio(audio,this.userName,this.idChat);
        }
      });
    }).catch(err=>console.log(err));

    this.dbChat.getItem(this.idChat)
    .then((chat:IChat)=>{
      this.chat=chat;
      chat.userNames.forEach(userName=>{
        if(userName!==this.userName){
          this.contactName=userName;
        };
      });
    }).catch(err=>console.log(err));

    const ref=this.firestore.collection("messages")
    .doc(this.idChat).collection<IMessage>("messages")
    .ref;
  }

  ngOnDestroy(){
    this.mensajesSubscribe.unsubscribe();
    this.audioSubscribe.unsubscribe();
    this.chatService.unsubscribe();
  }

  agregarMensaje(){
    const message=this.mensaje.value;
    this.chatService.addMessageInFirebase(message);
    this.mensaje.setValue('');
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverChatComponent,
      componentProps:{
        "id":this.idChat,
        "idUser":firebase.default.auth().currentUser.uid,
        "contactName":this.contactName
      },
      event: ev
    });
    return await popover.present();
  }

  addEmoji(event:any) {
    this.mensaje.setValue(this.mensaje.value+event.data);
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
    this.mediaRecorderService.stop();
    this.tiempoGrabacion='00:00';
    clearInterval(this.bucleTime);
  }

  public handleSlide(event: any): void {
    if(event.detail.ratio>=1 && this.tooglePress || event.detail.ratio==1){
      this.stop();
      this.cancelar=true;
    }
  }

  trackByFn(index:number, item:IMessage):string{
    return item.id;
  }
}
