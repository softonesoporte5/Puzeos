import { ToastService } from './../../services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from './../../services/loading.service';
import { Router } from '@angular/router';
import { DbService } from './../../services/db.service';
import { StoreNames } from './../../enums/store-names.enum';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { ImageModalComponent } from './../image-modal/image-modal.component';
import { Subscription } from 'rxjs';
import { IChat } from './../../interfaces/chat.interface';
import { AppService } from './../../app.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { FirebaseStorageService } from './../../services/firebase-storage.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUserData } from './../../interfaces/user.interface';
import { ModalController, NavParams, AlertController } from '@ionic/angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-perfil-group-modal',
  templateUrl: './perfil-group-modal.component.html',
  styleUrls: ['./perfil-group-modal.component.scss'],
})
export class PerfilGroupModalComponent implements OnInit, OnDestroy {

  userId:string;
  imgPath:string;
  chat:IChat;
  user:IUserData;
  localUser:IUserData;
  storageSubscribe:Subscription;
  httpSubscribe:Subscription;
  dbUsers:ILocalForage;
  loading: boolean = false;

  constructor(
    private navParams:NavParams,
    private modalController:ModalController,
    private firestore:AngularFirestore,
    private firebaseStorageService:FirebaseStorageService,
    private http:HttpClient,
    private appService:AppService,
    private db: DbService,
    private router: Router,
    private alertController: AlertController,
    private loadingService: LoadingService,
    private translate: TranslateService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.userId=this.navParams.get("userId");
    this.dbUsers=this.db.loadStore(StoreNames.Users);

    this.firestore.collection("users")
    .doc(this.userId)
    .get()
    .subscribe(resp=>{
      this.user=resp.data() as IUserData;
      this.user.createDate=this.user.createDate.toDate();
      if(!this.user.imageUrl){
        this.imgPath='assets/avatar/avatar_'+this.user.avatarId+'.jpg'
      }else{
        this.loading = true;
        this.storageSubscribe=this.firebaseStorageService.getUrlFile(this.user.imageUrl)
        .subscribe(downloadUrl=>{
          this.httpSubscribe=this.http.get(downloadUrl,{
            responseType:'blob',
            observe:'events'
          }).subscribe(async event=>{
            if(event.type===HttpEventType.Response){
              const date=new Date().valueOf();

              this.appService.convertBlobToBase64(event.body)
              .then((result:string | ArrayBuffer)=>{
                this.loading = false;
                this.imgPath=result as string;
              }).catch(err=>console.log(err));
            }
          });
        });
      }

      this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
      .then(resp=>{
        this.localUser=resp;
      })
    });
  }

  ngOnDestroy(){
    if(this.storageSubscribe){
      this.storageSubscribe.unsubscribe();
    }

    if(this.httpSubscribe){
      this.httpSubscribe.unsubscribe();
    }
  }

  close(){
    this.modalController.dismiss();
  }

  openModal(){
    this.modalController.create({
      component:ImageModalComponent,
      componentProps:{
        path:this.imgPath,
        type:'image'
      }
    }).then(modal=>modal.present());
  }

  async confirmCreateChat(){
    let titleTxt='';
    this.translate.get("ProfileModal.CreateChatConfirm").subscribe(resp=>titleTxt=resp);
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: titleTxt,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: "Confirm",
          handler: () => {
            this.createChat();
          }
        }
      ]
    });
    await alert.present();
  }

  createChat(){
    this.loadingService.present();
    this.firestore.collection("chats").add({
      group:false,
      lastMessage: "The chat has been created",
      timestamp:firebase.default.firestore.FieldValue.serverTimestamp(),
      members:{
        [firebase.default.auth().currentUser.uid]:true,
        [this.userId]:true
      },
      userNames:[
        this.localUser.userName,
        this.user.userName
      ],
      tokens:[
        this.localUser.token,
        this.user.token
      ],
      tema: "Private chat"
    }).then((resp)=>{
      resp.get()
      .then(chat=>{//Agregamos el chat a los usuarios
        this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid)
        .update({
          chats:firebase.default.firestore.FieldValue.arrayUnion(chat.id)
        }).then(()=>{
          this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
            ...this.localUser,
            chats:[...this.localUser.chats,chat.id]
          }).catch(err=>this.chatError());

          this.firestore.collection("users").doc(this.userId)
          .update({
            chats:firebase.default.firestore.FieldValue.arrayUnion(chat.id)
          }).then(()=>{//Redireccionamos al home
            this.loadingService.dismiss();
            this.close();
            this.router.navigate(['chat']);
          }).catch(()=>{
            this.chatError();
          });
        }).catch(()=>{
          this.chatError();
        })
      }).catch(()=>{
        this.chatError();
      });
    }).catch(()=>{
      this.chatError();
    })
  }

  private chatError(){
    this.loadingService.dismiss();
    this.translate.get("Error.Error").subscribe(resp=>{
      this.toastService.presentToast(resp);
    });
  }
}
