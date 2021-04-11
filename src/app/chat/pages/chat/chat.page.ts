import { IUserData } from './../../interfaces/user.interface';
import { AppService } from './../../../app.service';
import { AngularFirestore, DocumentData } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { PopoverController } from '@ionic/angular';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit{

  idChat:string;
  mensajes:any[]=[];
  userName:string='';
  showEmojiPicker:boolean=false;
  @ViewChild("content") content:ElementRef;

  miFormulario:FormGroup=this.fb.group({
    mensaje:['',[Validators.required,Validators.minLength(1)]]
  });

  mensaje:AbstractControl=this.miFormulario.get("mensaje");

  constructor(
    private fb:FormBuilder,
    private route:ActivatedRoute,
    private firestore:AngularFirestore,
    private appService:AppService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.idChat=this.route.snapshot.paramMap.get("id");

    this.firestore.collection("messages").doc(this.idChat).collection("messages")
      .ref
      .orderBy('timestamp')
      .onSnapshot(resp=>{
        resp.docChanges().forEach(mensaje=>{console.log(mensaje)
          if(!mensaje.doc.metadata.hasPendingWrites){//Comprobar si los datos vienen del servidor
            this.mensajes.push(mensaje.doc.data());
          }
        })
      })


    this.appService.obtenerUsuario()
    .subscribe((user:IUserData)=>{
      this.userName=user.userName;
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

}
