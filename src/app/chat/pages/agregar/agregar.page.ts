import { Router } from '@angular/router';
import { searchsUser } from './../../interfaces/searchsUser.interface';
import { AppService } from './../../../app.service';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit {

  items:any[]=[];
  user:any;

  constructor(
    private fireStore:AngularFirestore,
    private appService:AppService,
    private router:Router
  ) { }

  ngOnInit() {
    this.fireStore.collection("tags").ref.get()
    .then(items=>{
      items.forEach(item=>this.items=[...this.items,{id:item.id,data:item.data()}]);
    }).catch(error=>{
      console.log(error);
    });

    this.appService.obtenerUsuario()
    .subscribe(user=>{
      this.user=user;
    });
  }

  buscarCompa(tagId:string){//Añade al usuario en laa coleccion de busquedas
    this.fireStore.collection("searchs").doc(tagId).get()
    .subscribe((resp:DocumentSnapshot<searchsUser>)=>{

      let values:string[]=[];
      const data=resp.data();

      for (const key in data.users) {
        values=[...values,key];
      }

      if(values.length<1){//COmprobamos si no hay nadie buscando, en ese caso se inserta el usuario a la coleccion de busqueda
        this.fireStore.collection("searchs").doc(tagId).update({
          [`users.${this.user.id}`]:true
        }).then(()=>{

        }).catch(error=>{
          console.log(error);
        });

      }else{

        this.generarChat({//Creamos el chat
          [this.user.id]:true,
          [values[0]]:true
        },values[0]);
      }
    });
  }

  generarChat(members:object,contact:string){
    this.fireStore.collection("chats").add({
      group:false,
      lastMessage: "ghopper: Relay malfunction found. Cause: moth.",
      members:{
        ...members
      }
    }).then((resp)=>{
      resp.get()
      .then(chat=>{//Agregamos el chat a los usuarios
        this.fireStore.collection("users").doc(this.user.id)
        .update({
          [`chats.${chat.id}`]:true
        }).then(()=>{
          this.fireStore.collection("users").doc(contact)
          .update({
            [`chats.${chat.id}`]:true
          }).then(()=>{//Redireccionamos al home
            this.router.navigate(['chat']);
          }).catch(error=>{
            console.log(error);
          });
        }).catch(error=>{
          console.log(error);
        })
      }).catch(error=>{
        console.log(error);
      });
    });
  }

}
