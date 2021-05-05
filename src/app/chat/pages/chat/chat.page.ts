import { SQLite } from '@ionic-native/sqlite/ngx';
import { Subscription, Observable } from 'rxjs';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { MediaRecorderService } from './../../../services/media-recorder.service';
import { IUserData } from './../../interfaces/user.interface';
import { AppService } from './../../../app.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { PopoverController } from '@ionic/angular';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';
import { IMessage } from '../../interfaces/message.interface';
import { SqliteService } from 'src/app/services/sqlite.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit{

  idChat:string;
  mensajes:IMessage[]=[];
  userName:string='';
  showEmojiPicker:boolean=false;
  @ViewChild("content") content:ElementRef;
  tooglePress:boolean=false;
  progress=0;

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
    private sql:SqliteService
  ) { }

  ngOnInit() {
    this.idChat=this.route.snapshot.paramMap.get("id");

    this.appService.obtenerUsuario()
    .subscribe((user:IUserData)=>{
      this.userName=user.userName;

      this.mediaRecorderService.audio$
      .subscribe(audio=>{
        console.log(audio)
        this.firebaseStorageService.uploadAudio(audio,this.userName,this.idChat);
      });
    })

    this.firestore.collection("messages").doc(this.idChat).collection("messages")
    .ref
    .orderBy('timestamp')
    .onSnapshot(resp=>{
      resp.docChanges().forEach(mensaje=>{
        if(!mensaje.doc.metadata.hasPendingWrites){//Comprobar si los datos vienen del servidor
          const data=mensaje.doc.data() as IMessage;
          console.log(mensaje.type);
          if(data.type==='voice'){//Comprobar si es una nota de voz
            const getAudio:Subscription=this.firebaseStorageService.getAudio(data.ref)
            .subscribe(resp=>{
              this.mensajes.push({...data,ref:resp});
              getAudio.unsubscribe();
            });
          }
          else if(data.type==='text'){//Comprobar si es un mensaje de texto
            this.mensajes.push(data);
            if(data.user!==this.userName){
            }
          }
        }
      })
    })
  }

  agregarMensaje(){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;

    const mensaje=this.mensaje.value;

    this.firestore.collection("messages").doc(this.idChat).collection("messages").add({
      message:mensaje,
      user:this.userName,
      type:"text",
      timestamp:firebase.default.firestore.FieldValue.serverTimestamp()
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
    this.mediaRecorderService.recorder();
  }

  stop(){
    this.tooglePress=false;
     this.mediaRecorderService.stop();
  }
}
