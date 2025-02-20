import { ActionsUserService } from './../../../services/actions-user.service';
import { ITopic } from './../../../interfaces/topic.interface';
import { CreateChatService } from './../../../services/create-chat.service';
import { searchsUser } from './../../../interfaces/searchsUser.interface';
import { ILocalForage } from './../../../interfaces/localForage.interface';
import { IUser, IUserData } from './../../../interfaces/user.interface';
import { FirestoreService } from './../../../services/firestore.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { DbService } from './../../../services/db.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase';
import { StoreNames } from 'src/app/enums/store-names.enum';
import { faPaw, faGrinStars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit, OnDestroy {

  miFormulario:FormGroup=this.fb.group({
    searchTxt:['', [Validators.required, Validators.minLength(1)]]
  });
  allItems: ITopic[]=[];
  items: ITopic[]=[];
  user:IUser;
  buscando:boolean=false;
  userSubscription:Subscription;
  dbUsers:ILocalForage;
  dbTopics: ILocalForage;
  searchTxt:AbstractControl=this.miFormulario.get("searchTxt");
  search:string;
  popularTags:ITopic[]=[];
  searchLanguage:string;
  activeUsers: IUser[]=[];
  tagId:string;
  title:string;
  selectValue:string;
  chatType=false;
  chatsUserId: string[]=[];
  iconNames=["game-controller", "musical-notes", "terminal", "tv", "color-palette", "football", "people", "hardware-chip", "flask", "","apps", "book"];
  fontIcons=[faPaw, faGrinStars];

  constructor(
    private fireStore:AngularFirestore,
    private router:Router,
    private db:DbService,
    private fb:FormBuilder,
    private alertController: AlertController,
    private translate:TranslateService,
    public toastController: ToastController,
    private firestoreService: FirestoreService,
    private groupService: CreateChatService,
    private actionsUserService: ActionsUserService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore(StoreNames.Users);
    this.dbTopics=this.db.loadStore(StoreNames.Topics);

    let searchLanguage=localStorage.getItem("searchLanguage");
    if(searchLanguage){
      this.searchLanguage=searchLanguage;
    }

    this.dbTopics.getItem("topics")
    .then(tags=>{
      if(tags){
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
      }

      this.fireStore.collection("tags").ref.get()
      .then(items=>{
        let tags=[];
        items.forEach(item=>{
          const data=item.data() as any;
          let iconName: string;
          let fontIcon=false;
          if(String(data.iconName)){
            if(String(data.iconName).includes('a')){
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
        this.dbTopics.setItem("topics",this.allItems);
      }).catch(error=>{
        console.log(error);
      });
    },err=>console.log(err));


    let search='';

    //Buscador
    this.searchTxt.statusChanges.subscribe(()=>{
      search=this.searchTxt.value.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
      search=search.toLocaleLowerCase();
      this.search=search;

      let items=[];
      this.allItems.forEach((item:ITopic) => {
        let itemTxt=item.data.title.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
        itemTxt=itemTxt.toLocaleLowerCase();
        if(itemTxt.indexOf(search)!==-1){
          items.push(item);
        }
      });
      this.items=items.slice(0,20);
    })

    //Comprobamos si el usuario está buscando
    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then((user:IUserData)=>{
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };

      this.dbUsers.iterate((value, key)=>{
        if(this.user.id!==key){
          this.chatsUserId.push(key);
        }
      });

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

  setSearchData(tagId:string, title:string){
    this.buscando=true;
    this.tagId=tagId;
    this.title=title;
    if(this.searchLanguage){
      this.chatType=true;
    }
  }

  searchChat(chatType:number){//Añade al usuario en la coleccion de busquedas
    this.buscando=true;

    if(chatType===1){
      this.chatType=false;
      let searchSubscribe=this.fireStore.collection("searchs").doc(this.tagId).get()
      .subscribe((resp:DocumentSnapshot<searchsUser>)=>{
        searchSubscribe.unsubscribe();
        if(!resp){
          this.actualizarEstadoBusquedaUser(true,this.tagId);
          this.fireStore.collection("searchs").doc(this.tagId).update({
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
              if(
                !this.user.data.blockedUsers[key] &&
                !this.user.data.notAddUsers[key] &&
                data.users[key].language===this.searchLanguage &&
                !this.chatsUserId.includes(key)
              ){
                values.unshift({
                  id:key,
                  userName:data.users[key].userName,
                  token:data.users[key].token
                });
              }
            }

            if(values.length<1){//Comprobamos si no hay nadie buscando, en ese caso se inserta el usuario a la coleccion de busqueda
              this.actualizarEstadoBusquedaUser(true,this.tagId);
              this.fireStore.collection("searchs").doc(this.tagId).update({
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
              this.title,
              this.tagId
              );
              this.fireStore.collection("searchs").doc(this.tagId).update({//Eliminamos al usuario de la tabla de busquedas
                [`users.${values[0].id}`]:firebase.default.firestore.FieldValue.delete()
              })
            }
          }else{
            this.actualizarEstadoBusquedaUser(true,this.tagId);
            this.fireStore.collection("searchs").doc(this.tagId).set({
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
      this.groupService.createGroup(this.tagId+this.searchLanguage, this.user, this.title);
    }
  }

  setSearchLanguage(){
    if(this.selectValue){
      localStorage.setItem("searchLanguage",this.selectValue);
      this.searchLanguage=this.selectValue;
      this.chatType=true;
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

  trackItems(index: number, item: ITopic) {
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
    let sendMessage='';
    this.translate.get("AgregarPage.SendTopic").subscribe(resp=>sendMessage=resp);
    let errorTxt='';
    this.translate.get("Error.Error").subscribe(resp=>errorTxt=resp);

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
          handler: (value) => {
            console.log(value[0].trim())
            if(value[0].trim() !== ''){
              const themeTxt=document.querySelector("#newThemeTxt") as HTMLInputElement;
              this.fireStore.collection("newTags").add({
                title:themeTxt.value,
                notificationToken:this.user.data.token
              }).then(()=>{
                this.presentToast(sendMessage);
              })
              .catch(error=>{
                this.presentToast(errorTxt);
              });
            }
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

  segmentChanged(ev: any) {
    if(ev.detail.value === "Activos"){
      document.querySelector("#cont-2").className = "";
      document.querySelector("#cont-1").className = "oculto";
      this.fireStore.collection("users").ref.where("online", "==", true)
      .get()
      .then((querySnapshot) => {
        let usersTmp = [];
        querySnapshot.docs.forEach(ele=>{
          usersTmp.push({
            id: ele.id,
            data: ele.data()
          });
        });

        this.activeUsers = usersTmp;
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
    }else{
      document.querySelector("#cont-2").className = "oculto";
      document.querySelector("#cont-1").className = "";
    }
  }

  viewProfile(id: string){
    this.actionsUserService.viewProfile(id);
  }
}
