import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from './../../../services/db.service';
import { Subscription } from 'rxjs';
import { IUser } from './../../interfaces/user.interface';
import { Router } from '@angular/router';
import { searchsUser } from './../../interfaces/searchsUser.interface';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase';

interface IItem{
  id:string,
  data:{
    title:string
  },
  color:string
}

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit, OnDestroy {

  miFormulario:FormGroup=this.fb.group({
    searchTxt:['', [Validators.required, Validators.minLength(1)]]
  });
  items:IItem[]=[];
  user:IUser;
  buscando:boolean=false;
  userSubscription:Subscription;
  dbUsers:ILocalForage;
  searchTxt:AbstractControl=this.miFormulario.get("searchTxt");
  search:string;

  constructor(
    private fireStore:AngularFirestore,
    private router:Router,
    private db:DbService,
    private fb:FormBuilder
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");

    //Almacenar los tags en el sessionStorage para que no cargen cada vez
    if(sessionStorage.getItem("tags")){
      this.items=JSON.parse(sessionStorage.getItem("tags"));
    }else{
      this.fireStore.collection("tags").ref.get()
      .then(items=>{
        items.forEach(item=>{
          const title=item.data() as any;
          this.items.push({
            id:item.id,
            data:{
              title:title.title
            },
            color:this.colorRGB()
          });
        });
        sessionStorage.setItem("tags",JSON.stringify(this.items));
      }).catch(error=>{
        console.log(error);
      });
    }

    let search='';

    this.searchTxt.statusChanges.subscribe(()=>{
      this.items=JSON.parse(sessionStorage.getItem("tags"));
      search=this.searchTxt.value.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
      search=search.toLocaleLowerCase();
      this.search=search;

      if(this.searchTxt.value.trim()!==''){
        let items=[];
        this.items.forEach((item:IItem) => {
          let itemTxt=item.data.title.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
          itemTxt=itemTxt.toLocaleLowerCase();
          if(itemTxt.indexOf(search)!==-1){
            items.push(item);
          }
        });
        this.items=items;
      }
    })

    //Comprobamos si el usuario está buscando
    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      console.log(user);
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };

      this.buscando=this.user.data.buscando.state;

      this.userSubscription=this.db.obtenerUsuario()
      .subscribe(user=>{
        this.user={
          id:firebase.default.auth().currentUser.uid,
          data:{...user}
        };

        if(user){
          this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
            ...user
          }).catch(err=>console.log(err));
        }

        this.buscando=this.user.data.buscando.state;
      });
    }).catch(err=>console.log(err));
  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
  }

  colorRGB(){
    function generarNumero(numero:number){
      return (Math.random()*numero).toFixed(0);
    }
    var coolor = "("+generarNumero(255)+"," + generarNumero(255) + "," + generarNumero(190) +")";
    return "rgb" + coolor;
  }

  actualizarEstadoBusquedaUser(estado:boolean, tagId:string=''){
    this.buscando=estado;
    this.user.data.buscando={state:estado,tagId:tagId};

    this.fireStore.collection("users").doc(this.user.id).update({
      buscando:{
        state:estado,
        tagId:tagId
      }
    }).catch(error=>{
      console.log("Hubo un error",error);
    });
  }

   buscarCompa(tagId:string, title:string){//Añade al usuario en la coleccion de busquedas
    this.buscando=true;

    let searchSubscribe=this.fireStore.collection("searchs").doc(tagId).get()
    .subscribe((resp:DocumentSnapshot<searchsUser>)=>{
      searchSubscribe.unsubscribe();
      console.log(resp);
      if(!resp){
        this.fireStore.collection("searchs").doc(tagId).set({
          [`users.${this.user.id}`]:this.user.data.userName
        }).catch(error=>console.log(error));
      }else{
        let values:any[]=[];
        const data=resp.data();

        if(!this.user.data.notAddUsers){
          this.user.data.notAddUsers=[];
        }
        if(data){
          for(const key in data.users) {
            if(!this.user.data.blockedUsers[key] && !this.user.data.notAddUsers[key]){
              values.unshift({
                id:key,
                userName:data.users[key].userName,
                token:data.users[key].token
              });
            }
          }

          if(values.length<1){//Comprobamos si no hay nadie buscando, en ese caso se inserta el usuario a la coleccion de busqueda
            this.actualizarEstadoBusquedaUser(true,tagId);
            this.fireStore.collection("searchs").doc(tagId).update({
              [`users.${this.user.id}`]:{
                userName:this.user.data.userName,
                token:this.user.data.token
              }
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
            ],
            [
              this.user.data.token,
              values[0].token
            ],
            title);
            this.fireStore.collection("searchs").doc(tagId).update({//Eliminamos al usuario de la tabla de busquedas
              [`users.${values[0].id}`]:firebase.default.firestore.FieldValue.delete()
            })
          }
        }else{
          this.fireStore.collection("searchs").doc(tagId).set({
            [`users.${this.user.id}`]:this.user.data.userName
          }).catch(error=>console.log(error));
        }
      }
    });
  }

  generarChat(members:object,contact:string, userNames:string[],tokens:string[],title:string){
    this.fireStore.collection("chats").add({
      group:false,
      lastMessage: "Se ha creado el chat",
      timestamp:firebase.default.firestore.FieldValue.serverTimestamp(),
      members:{
        ...members
      },
      userNames:userNames,
      tokens:tokens,
      tema:title
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

  cancelarBusqueda(){
    // Elimina al usuario del documento de busqueda

    this.fireStore.collection("searchs").doc(this.user.data.buscando.tagId).update({
      [`users.${this.user.id}`]:firebase.default.firestore.FieldValue.delete()
    }).then(()=>{
      this.actualizarEstadoBusquedaUser(false);
    })
  }


  trackItems(index: number, item: IItem) {
    return item.id;
  }
}
