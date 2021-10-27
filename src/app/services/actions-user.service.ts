import { TranslateService } from '@ngx-translate/core';
import { IUserData } from './../interfaces/user.interface';
import { ILocalForage } from './../interfaces/localForage.interface';
import { LoadingService } from './loading.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { DbService } from 'src/app/services/db.service';
import {  ToastController, PopoverController, AlertController } from '@ionic/angular';
import * as firebase from 'firebase';
import { StoreNames } from '../enums/store-names.enum';

const localForage = require("localforage") as ILocalForage;

@Injectable({
  providedIn: 'root'
})
export class ActionsUserService {

  dbChats:ILocalForage;
  dbUser:ILocalForage;
  saved:boolean=true;
  idChat:string;
  idUser:string=firebase.default.auth().currentUser.uid;
  contactName:string;
  contactID:string;

  constructor(
    private toastController: ToastController,
    private db:DbService,
    private alertController: AlertController,
    private fireStore:AngularFirestore,
    private router:Router,
    private loadingService:LoadingService,
    private popoverController: PopoverController,
    private translate: TranslateService
  ) { }

  deleteChatInDevice(blocked?:boolean){
    this.translate.get("ChatPage.DeletingChat").subscribe(resp=>{
      this.loadingService.present(resp);
    });
    this.dbChats=this.db.loadStore(StoreNames.Chats);
    this.dbUser=this.db.loadStore(StoreNames.Users);

    this.dbUser.getItem(this.idUser)
    .then((resp:IUserData)=>{
      if(resp){
        let chats=resp.chats.filter(chat=>chat!==this.idChat);

        this.fireStore.collection("users").doc(this.idUser)
        .update({
          chats:chats
        }).then(()=>{
          this.dbChats.removeItem(this.idChat)
          .then(()=>{

            this.dbUser.setItem(this.idUser,{
              ...resp,
              chats:chats
            }).then(()=>{

              localForage.dropInstance({
                name: localForage._config.name,
                storeName: "messages"+this.idChat
              }).then(()=>{

                this.loadingService.dismiss();
                this.popoverController.dismiss();
                if(blocked){
                  this.router.navigate(['chat'], { queryParams: {
                    deleteChat:this.idChat,
                    blockUser:JSON.stringify({
                      userName:resp.userName,
                      id:this.idUser
                    })
                  }
                  });

                }else{
                  this.router.navigate(['chat'], { queryParams: { deleteChat:this.idChat}});
                }
              }).catch(err=>console.log(err));

            }).catch(err=>console.log(err));
          }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));
      }
    }).catch(err=>console.log(err));
  }

  blockedUserInDevice(){
    this.translate.get("ChatPage.BlockingUser").subscribe(resp=>{
      this.loadingService.present(resp);
    });
    this.dbChats=this.db.loadStore(StoreNames.Chats);
    this.dbUser=this.db.loadStore(StoreNames.Users);

    this.dbUser.getItem(this.idUser)
    .then((resp:IUserData)=>{
      if(resp){
        if(resp.blockedUsers){
          resp.blockedUsers[this.contactID]=this.contactName;
        }
        this.fireStore.collection("users").doc(this.idUser)
        .update({
          blockedUsers:resp.blockedUsers
        }).then(()=>{
          this.dbUser.setItem(this.idUser,{
            ...resp,
            blockedUsers:resp.blockedUsers
          }).then(()=>{
            this.loadingService.dismiss();
            this.deleteChatInDevice(true)
          }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));
      }
    }).catch(err=>console.log(err));
  }

  async presentAlertConfirm(action:number=1, idChat:string, contactName:string,contactID?:string) {
    let message='';
    let actionText='';
    this.idChat=idChat;
    this.contactName=contactName;
    if(contactID)this.contactID=contactID;

    if(action===1){
      this.translate.get("ChatPage.ConfimMessage").subscribe(resp=>message=resp);
      this.translate.get("ChatPage.Delete").subscribe(resp=>actionText=resp);
    }
    else{
      this.translate.get("ChatPage.BlockConfirm").subscribe(resp=>message=resp);
      this.translate.get("ChatPage.Block").subscribe(resp=>actionText=resp);
    }

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: actionText,
          handler: () => {
            if(action===1)this.deleteChatInDevice();
            else this.blockedUserInDevice();
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(mensaje:string){
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 3000,
      color:"danger"
    });
    toast.present();
  }
}
