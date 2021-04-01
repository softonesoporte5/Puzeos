import { AppService } from './../../../app.service';
import { Action, AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  idChat:string;
  mensajes:any[]=[];
  userName:string='';

  miFormulario:FormGroup=this.fb.group({
    mensaje:['',[Validators.required,Validators.minLength(1)]]
  });

  constructor(
    private fb:FormBuilder,
    private route:ActivatedRoute,
    private firestore:AngularFirestore,
    private appService:AppService
  ) { }

  ngOnInit() {
    this.idChat=this.route.snapshot.paramMap.get("id");

    this.firestore.collection("messages").doc(this.idChat)
    .snapshotChanges()
    .subscribe((resp:Action<any>)=>{
      this.mensajes=[];
      const data=resp.payload.data();

      for (const property in data) {
        this.mensajes=[data[property],...this.mensajes];
      }
    })

    this.appService.obtenerUsuario()
    .subscribe(user=>{
      this.userName=user.id;
    })

  }

  agregarMensaje(){
    const date=new Date().valueOf()
    const randomId=Math.round(Math.random()*1000)+date;
    this.firestore.collection("messages").doc(this.idChat).update({
      [randomId]:{
        message:this.miFormulario.get("mensaje").value,
        user:this.userName,
        timestamp:firebase.default.database.ServerValue.TIMESTAMP
      }
    }).catch(error=>{
      this.firestore.collection("messages").doc(this.idChat).set({
        [randomId]:{
          message:this.miFormulario.get("mensaje").value,
          user:this.userName,
          timestamp:firebase.default.database.ServerValue.TIMESTAMP
        }
      })
    });

    this.firestore.collection("chats").doc(this.idChat).update({//Agregar ultimo mensaje al chat
      lastMessage:`${this.miFormulario.get("mensaje").value}`
    })

    this.miFormulario.get("mensaje").setValue('');
  }
}
