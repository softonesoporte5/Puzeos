import { Subscription } from 'rxjs';
import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { MediaRecorderService } from './../../../services/media-recorder.service';
import { IUserData } from './../../interfaces/user.interface';
import { AppService } from './../../../app.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { IonItemSliding, PopoverController } from '@ionic/angular';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';
import { IMessage } from '../../interfaces/message.interface';


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
  @ViewChild("content") content:ElementRef;
  tooglePress:boolean=false;
  progress=0;
  dbChat:ILocalForage;
  dbMessages:ILocalForage;
  dbUsers:ILocalForage;
  obtenerUsuarioSubscribe:Subscription;
  mensajesSubscribe:any;
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
    private appService:AppService,
    private popoverController: PopoverController,
    private mediaRecorderService:MediaRecorderService,
    private firebaseStorageService:FirebaseStorageService,
    private db:DbService
  ) { }

  ngOnInit(){
    this.dbUsers=this.db.loadStore("users");
    this.idChat=this.route.snapshot.paramMap.get("id");
    this.dbChat=this.db.loadStore("chats");
    this.dbMessages=this.db.loadStore("messages"+this.idChat);

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.userName=user.userName;

      this.mediaRecorderService.audio$
      .subscribe(audio=>{
        if(!this.cancelar){
          this.firebaseStorageService.uploadAudio(audio,this.userName,this.idChat);
        }
      });
    }).catch(err=>console.log(err));

    this.dbChat.getItem(this.idChat)
    .then((chat:IChat)=>{console.log(chat)
      chat.userNames.forEach(userName=>{
        if(userName!==this.userName){
          this.contactName=userName;
        };
      });

    }).catch(err=>console.log(err));

    let cont=0;
    this.dbMessages.iterate((values,key,iterationNumber)=>{
      this.mensajes[cont]={
          ...values
        }
      cont++;
    }).then(()=>console.log("completo"))
    .catch(error=>{
      console.log(error);
    });

    this.mensajesSubscribe=this.firestore.collection("messages").doc(this.idChat).collection("messages")
    .ref
    .orderBy('timestamp')
    .onSnapshot(resp=>{
      resp.docChanges().forEach(mensaje=>{
        if(mensaje.type!=='removed'){
          if(!mensaje.doc.metadata.hasPendingWrites){//Comprobar si los datos vienen del servidor
            console.log(mensaje.doc.id)
            this.dbMessages.getItem(mensaje.doc.id)
            .then(resp=>{
              if(!resp){
                const data=mensaje.doc.data() as IMessage;

                this.mensajes.push({
                  ...data,
                  id:mensaje.doc.id,
                  download:false,
                  timestamp:data.timestamp.toDate()
                });

                if(data.user!==this.userName){
                  this.firestore.collection("messages").doc(this.idChat)
                  .collection("messages").doc(mensaje.doc.id)
                  .delete()
                  .catch(error=>{
                    console.log(error);
                  });
                }

                this.dbMessages.setItem(mensaje.doc.id,{
                  id:mensaje.doc.id,
                  ...data,
                  download:false,
                  timestamp:data.timestamp.toDate(),
                }).then(()=>{

                 }).catch(error=>{
                  console.log(error);
                });
              }
            }).catch(err=>{console.log(err)});

          }
        }
      })
    });

  }

  ngOnDestroy(){
    this.obtenerUsuarioSubscribe.unsubscribe();
    this.mensajesSubscribe();
  }

  agregarMensaje(){
    const mensaje=this.mensaje.value;

    this.firestore.collection("messages").doc(this.idChat).collection("messages").add({
      message:mensaje,
      user:this.userName,
      type:"text",
      timestamp:firebase.default.firestore.FieldValue.serverTimestamp()
    }).then(message=>{
    }).catch(error=>{
      console.log(error);
    });

    this.firestore.collection("chats").doc(this.idChat).update({//Agregar ultimo mensaje al chat
      lastMessage:`${mensaje}`
    })

    this.mensaje.setValue('');
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverChatComponent,
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
}
