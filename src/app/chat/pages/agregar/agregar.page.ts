import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from './../../../services/db.service';
import { Subscription } from 'rxjs';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { Router } from '@angular/router';
import { searchsUser } from './../../interfaces/searchsUser.interface';
import { AppService } from './../../../app.service';
import { AngularFirestore, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit, OnDestroy {

  items:any=[];
  user:IUser;
  buscando:boolean=false;
  userSubscription:Subscription;
  dbUsers:ILocalForage;

  constructor(
    private fireStore:AngularFirestore,
    private appService:AppService,
    private router:Router,
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");

    //Almacenar los tags en el sessionStorage para que no cargen cada vez
    if(sessionStorage.getItem("tags")){
      this.items=JSON.parse(sessionStorage.getItem("tags"));
    }else{
      this.fireStore.collection("tags").ref.get()
      .then(items=>{
        items.forEach(item=>this.items=[...this.items,{id:item.id,data:item.data()}]);
        sessionStorage.setItem("tags",JSON.stringify(this.items));
      }).catch(error=>{
        console.log(error);
      });
    }

    //Comprobamos si existe el sessionStorage de buscando
    if(JSON.parse(sessionStorage.getItem("buscando"))){
      this.buscando=JSON.parse(sessionStorage.getItem("buscando")).state;
    }
    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };

      this.buscando=this.user.data.buscando.state;
      sessionStorage.setItem("buscando",JSON.stringify(this.user.data.buscando));

      this.userSubscription=this.appService.obtenerUsuario()
      .subscribe(user=>{
        this.user={
          id:firebase.default.auth().currentUser.uid,
          data:{...user}
        };

        this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
          ...user
        }).catch(err=>console.log(err));

        this.buscando=this.user.data.buscando.state;
        sessionStorage.setItem("buscando",JSON.stringify(this.user.data.buscando));
      });
    }).catch(err=>console.log(err));
  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
  }

  actualizarEstadoBusquedaUser(estado:boolean, tagId:string=''){
    this.buscando=estado;
    sessionStorage.setItem("buscando",JSON.stringify({state:estado,tagId:tagId}));

    this.fireStore.collection("users").doc(this.user.id).update({
      buscando:{
        state:estado,
        tagId:tagId
      }
    }).then(()=>{
      this.dbUsers.setItem(this.user.id,{
        ...this.user.data,
        buscando:{
          state:estado,
          tagId:tagId
        }
      }).catch(err=>console.log(err));
    })
    .catch(error=>{
      console.log("Hubo un error",error);
    });
  }

  buscarCompa(tagId:string){//Añade al usuario en la coleccion de busquedas
    this.buscando=true;

    this.fireStore.collection("searchs").doc(tagId).get()
    .subscribe((resp:DocumentSnapshot<searchsUser>)=>{
      let values:any[]=[];
      const data=resp.data();
      console.log(this.user.data);
      for(const key in data.users) {
        if(!this.user.data.blockedUsers.includes(data.users[key])){
          values.unshift({id:key,userName:data.users[key]});
        }
      }

      if(values.length<1){//Comprobamos si no hay nadie buscando, en ese caso se inserta el usuario a la coleccion de busqueda
        this.actualizarEstadoBusquedaUser(true,tagId);
        this.fireStore.collection("searchs").doc(tagId).update({
          [`users.${this.user.id}`]:this.user.data.userName
        }).catch(error=>{
          console.log(error);
        });

      }else{
        this.generarChat({//Creamos el chat
          [this.user.id]:true,
          [values[0].id]:true
        },
        values[0].id,
        [
          this.user.data.userName,
          values[0].userName
        ]
        );
        this.fireStore.collection("searchs").doc(tagId).update({//Eliminamos al usuario de la tabla de busquedas
          [`users.${values[0].id}`]:firebase.default.firestore.FieldValue.delete()
        })
      }
    });
  }

  generarChat(members:object,contact:string, userNames:string[]){
    this.fireStore.collection("chats").add({
      group:false,
      lastMessage: "Se ha creado el chat",
      timestamp:firebase.default.firestore.FieldValue.serverTimestamp(),
      members:{
        ...members
      },
      userNames:userNames
    }).then((resp)=>{
      resp.get()
      .then(chat=>{//Agregamos el chat a los usuarios
        this.fireStore.collection("users").doc(this.user.id)
        .update({
          buscando:{
            tagId:"",
            state:false
          },
          chats:firebase.default.firestore.FieldValue.arrayUnion(chat.id)
        }).then(()=>{
          this.dbUsers.setItem(this.user.id,{
            ...this.user.data,
            buscando:{
              tagId:"",
              state:false
            },
            chats:[...this.user.data.chats,chat.id]
          }).catch(err=>console.log(err));

          this.fireStore.collection("users").doc(contact)
          .update({
            buscando:{
              tagId:"",
              state:false
            },
            chats:firebase.default.firestore.FieldValue.arrayUnion(chat.id)
          }).then((resp)=>{//Redireccionamos al home
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

  cancelarBusqueda(){
    // Elimina al usuario del documento de busqueda
    const buscandoState=JSON.parse(sessionStorage.getItem("buscando"));

    this.fireStore.collection("searchs").doc(buscandoState.tagId).update({
      [`users.${this.user.id}`]:firebase.default.firestore.FieldValue.delete()
    }).then(()=>{
      this.actualizarEstadoBusquedaUser(false);
    })
  }
}
