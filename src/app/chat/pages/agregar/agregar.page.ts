import { FirestoreService } from './../../../services/firestore.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from './../../../services/db.service';
import { Subscription } from 'rxjs';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { Router } from '@angular/router';
import { searchsUser } from './../../interfaces/searchsUser.interface';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase';
import { StoreNames } from 'src/app/enums/store-names.enum';
import { faPaw, faGrinStars } from '@fortawesome/free-solid-svg-icons';

interface IItem{
  id:string,
  data:{
    title:string,
    imgName: string
  },
  chatsCreated?:number,
  iconName: string ,
  fontIcon: boolean
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
  allItems: IItem[]=[];
  items: IItem[]=[];
  user:IUser;
  buscando:boolean=false;
  userSubscription:Subscription;
  dbUsers:ILocalForage;
  searchTxt:AbstractControl=this.miFormulario.get("searchTxt");
  search:string;
  popularTags:IItem[]=[];
  searchLanguage:string;
  tagId:string;
  title:string;
  selectValue:string;
  iconNames=["game-controller", "musical-notes", "terminal", "tv", "color-palette", "football", "people", "hardware-chip", "flask", "","apps"];
  fontIcons=[faPaw, faGrinStars];

  constructor(
    private fireStore:AngularFirestore,
    private router:Router,
    private db:DbService,
    private fb:FormBuilder,
    private alertController: AlertController,
    private translate:TranslateService,
    public toastController: ToastController,
    private firestoreService: FirestoreService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore(StoreNames.Users);
    let searchLanguage=localStorage.getItem("searchLanguage");
    if(searchLanguage){
      this.searchLanguage=searchLanguage;
    }
    //Almacenar los tags en el sessionStorage para que no cargen cada vez
    if(sessionStorage.getItem("tags")){
      this.allItems=JSON.parse(sessionStorage.getItem("tags"))
      this.items=this.allItems.slice(0,20);
    }else{
      let tags=[];
      this.fireStore.collection("tags").ref.get()
      .then(items=>{
        items.forEach(item=>{
          const data=item.data() as any;
          let iconName: string;
          let fontIcon=false;
          if(String(data.iconName)){
            if(String(data.iconName).includes('a')){
              console.log(this.fontIcons[data.iconName.replace('a','')])
              iconName=data.iconName.replace('a','');
              fontIcon=true;
            }else{
              iconName=this.iconNames[data.iconName];
              fontIcon=false;
            }
          }
          tags.push({
            id:item.id,
            data:{
              title:data.title,
              imgName: data.title.replace(/ /g,'-').replace(':','')
            },
            chatsCreated:data.chatsCreated?data.chatsCreated:0,
            iconName: iconName,
            fontIcon: fontIcon
          });
        });
        this.allItems=tags.sort((a, b)=>{
          if (a.chastCreated < b.chatsCreated) {
            return 1;
          }
          if (a.chatsCreated > b.chatsCreated) {
            return -1;
          }
          return 0;
        });
        this.items=this.allItems.slice(0,20);
        sessionStorage.setItem("tags",JSON.stringify(this.allItems));
      }).catch(error=>{
        console.log(error);
      });
    }

    let search='';

    this.searchTxt.statusChanges.subscribe(()=>{
      this.allItems=JSON.parse(sessionStorage.getItem("tags"));
      search=this.searchTxt.value.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
      search=search.toLocaleLowerCase();
      this.search=search;

      let items=[];
      this.allItems.forEach((item:IItem) => {
        let itemTxt=item.data.title.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
        itemTxt=itemTxt.toLocaleLowerCase();
        if(itemTxt.indexOf(search)!==-1){
          items.push(item);
        }
      });
      this.allItems=items;
      console.log(items)
      this.items=this.allItems.slice(0,20);
    })

    //Comprobamos si el usuario está buscando
    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then((user:IUserData)=>{
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };

      this.buscando=this.user.data.buscando.state;
      if(user.buscando.state && !this.searchLanguage){
        this.searchLanguage='.';
      }
      this.userSubscription=this.firestoreService.getUser()
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

    if(this.searchLanguage){
      let searchSubscribe=this.fireStore.collection("searchs").doc(tagId).get()
      .subscribe((resp:DocumentSnapshot<searchsUser>)=>{
        searchSubscribe.unsubscribe();
        if(!resp){
          this.actualizarEstadoBusquedaUser(true,tagId);
          this.fireStore.collection("searchs").doc(tagId).update({
            users:{
              [this.user.id]:{
                userName:this.user.data.userName,
                token:this.user.data.token,
                language:this.searchLanguage
              }
            }
          }).catch(error=>console.log(error));
        }else{
          let values:any[]=[];
          const data=resp.data();

          if(!this.user.data.notAddUsers){
            this.user.data.notAddUsers=[];
          }
          if(data){
            for(const key in data.users) {
              if(!this.user.data.blockedUsers[key] && !this.user.data.notAddUsers[key] && data.users[key].language===this.searchLanguage){
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
                  token:this.user.data.token,
                  language:this.searchLanguage
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
              title,
              tagId
              );
              this.fireStore.collection("searchs").doc(tagId).update({//Eliminamos al usuario de la tabla de busquedas
                [`users.${values[0].id}`]:firebase.default.firestore.FieldValue.delete()
              })
            }
          }else{
            this.actualizarEstadoBusquedaUser(true,tagId);
            this.fireStore.collection("searchs").doc(tagId).set({
              users:{
                [this.user.id]:{
                  userName:this.user.data.userName,
                  token:this.user.data.token,
                  language:this.searchLanguage
                }
              }
            }).catch(error=>console.log(error));
          }
        }
      });
    }else{
      this.tagId=tagId;
      this.title=title;
    }
  }

  setSearchLanguage(){
    if(this.selectValue){
      localStorage.setItem("searchLanguage",this.selectValue);
      this.searchLanguage=this.selectValue;
      this.buscarCompa(this.tagId, this.title);
    }else{
      this.translate.get("AgregarPage.ToastMessage").subscribe(resp=>{
        this.presentToast(resp);
      });
    }
  }

  generarChat(members:object,contact:string, userNames:string[],tokens:string[],title:string, tagId:string){
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
            console.log(tagId)
            this.fireStore.collection("tags").doc(tagId).update({
              chatsCreated: firebase.default.firestore.FieldValue.increment(1)
            });
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

  async addTheme(){
    let headerTxt='';
    this.translate.get("AgregarPage.ApplyFor").subscribe(resp=>headerTxt=resp);
    let messageTxt='';
    this.translate.get("AgregarPage.RequestTxt").subscribe(resp=>messageTxt=resp);
    let inputTxt='';
    this.translate.get("AgregarPage.Placeholder").subscribe(resp=>inputTxt=resp);
    let cancelTxt='';
    this.translate.get("Global.Cancel").subscribe(resp=>cancelTxt=resp);
    let sendTxt='';
    this.translate.get("AgregarPage.Send").subscribe(resp=>sendTxt=resp);

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: headerTxt,
      message: messageTxt,
      inputs: [
        {
          id: 'newThemeTxt',
          type: 'text',
          placeholder: inputTxt,
          attributes: {
            maxlength: 40
          }
        },
      ],
      buttons: [
        {
          text: cancelTxt,
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: sendTxt,
          handler: () => {
            const themeTxt=document.querySelector("#newThemeTxt") as HTMLInputElement;
            this.fireStore.collection("newTags").add({
              title:themeTxt.value,
              notificationToken:this.user.data.token
            }).catch(error=>{
              console.log("Hubo un error",error);
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(text:string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 1500,
      position: 'top'
    });
    toast.present();
  }

  loadData(event) {
    this.items=this.allItems.slice(0, this.items.length+20);
    event.target.complete();

    if (this.items.length===this.allItems.length && !this.searchTxt.value) {
      event.target.disabled = true;
    }
  }
}
