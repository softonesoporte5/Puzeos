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

      this.mediaRecorderService.audio$
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

    let cont=0;
    this.dbMessages.iterate((values)=>{
      this.mensajes[cont]={
          ...values
        }
      cont++;
    }).then(()=>{
      this.mensajes=this.chatService.orderMessages(this.mensajes)
    })
    .catch(error=>{
      console.log(error);
    });

    const a=this.firestore.collection("messages")
    .doc(this.idChat).collection<IMessage>("messages").ref

    const ref=this.firestore.collection("messages")
    .doc(this.idChat).collection<IMessage>("messages")
    .ref;

    this.mensajesSubscribe=this.chatService.getMessages(ref, this.idChat, this.userName)
    .subscribe(resp=>{
      //Si viene más de un mensaje
      if(resp.length>1){
        for (let index = 0; index < resp.length; index++) {
          const message=resp[index].doc.data();
          console.log(resp[index].type,message);
          //Si es un mensaje nuevo
          if(resp[index].type!=='removed'){
            //Comprobamos si es un mensaje que fue visto
            if(message.state===true){
              //Lo agregamos a la base de datos local
              this.dbMessages.setItem(message.id,{
                ...message,
                state:true
              })
              .then(resp=>{})
              .catch(error=>console.log(error));

            }
          }else{
            if(message.user!==this.userName){
              this.firestore.collection("messages").doc(this.idChat)
              .collection("messages").doc(message.id)
              .delete()
              .catch(error=>{
                console.log(error);
              });
            }
          }
        }
      }else{
        const data=resp[0].doc.data();
        console.log(resp[0].type,data);
        this.mensajes.push({
          ...data,
          id:resp[0].doc.id,
          download:false,
          timestamp:data.timestamp.toDate(),
          state:false
        })
      }
    })
  }

  ngOnDestroy(){
    this.mensajesSubscribe();
  }

  agregarMensaje(){
    const mensaje=this.mensaje.value;
    const timestamp=firebase.default.firestore.FieldValue.serverTimestamp()

    this.firestore.collection("messages").doc(this.idChat).collection("messages").add({
      message:mensaje,
      user:this.userName,
      type:"text",
      timestamp:timestamp
    }).catch(error=>{
      console.log(error);
    });

    this.firestore.collection("chats").doc(this.idChat).update({//Agregar ultimo mensaje al chat
      lastMessage:`${mensaje}`,
      timestamp:timestamp
    })

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
