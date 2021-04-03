import { AppService } from './../../../app.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { PopoverController } from '@ionic/angular';
import { PopoverChatComponent } from 'src/app/components/popover-chat/popover-chat.component';

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
    private appService:AppService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.idChat=this.route.snapshot.paramMap.get("id");

    this.firestore.collection("messages").doc(this.idChat)
    .valueChanges()
    .subscribe((resp:any)=>{
      console.log(resp.message)
      // const data=resp.payload.data();
      // this.mensajes=[data[property],...this.mensajes];
    })

    this.appService.obtenerUsuario()
    .subscribe(user=>{
      this.userName=user.id;
    })

  }

  agregarMensaje(){
    const date=new Date().valueOf();
    const randomId=Math.round(Math.random()*1000)+date;
    const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();


    this.firestore.collection("messages").doc(this.idChat).update({
      messages:firebase.default.firestore.FieldValue.arrayUnion({
        message:this.miFormulario.get("mensaje").value,
        user:this.userName,
        type:"text",
        timestamp:timestamp
      })
    }).catch(error=>{
      this.firestore.collection("messages").doc(this.idChat).set({
        messages:firebase.default.firestore.FieldValue.arrayUnion({
          message:this.miFormulario.get("mensaje").value,
          user:this.userName,
          type:"text",
          timestamp:timestamp
        })
      })
    });

    this.firestore.collection("chats").doc(this.idChat).update({//Agregar ultimo mensaje al chat
      lastMessage:`${this.miFormulario.get("mensaje").value}`
    })

    this.miFormulario.get("mensaje").setValue('');
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverChatComponent,
      event: ev
    });
    return await popover.present();
  }
}
