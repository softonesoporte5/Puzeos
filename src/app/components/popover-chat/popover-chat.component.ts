import { LoadingService } from './../../services/loading.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { ILocalForage } from './../../chat/interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { Component, OnInit } from '@angular/core';
import { NavParams, ToastController, PopoverController, AlertController } from '@ionic/angular';
const localForage = require("localforage") as ILocalForage;

@Component({
  selector: 'app-popover-chat',
  templateUrl: './popover-chat.component.html',
  styleUrls: ['./popover-chat.component.scss'],
})
export class PopoverChatComponent implements OnInit {

  dbChats:ILocalForage;
  dbUser:ILocalForage;
  saved:boolean=true;
  idChat:string;
  idUser:string;
  contactName:string;

  constructor(
    private navParams: NavParams,
    public toastController: ToastController,
    private db:DbService,
    public alertController: AlertController,
    private fireStore:AngularFirestore,
    private router:Router,
    private loadingService:LoadingService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.idChat=this.navParams.data.id;
    this.idUser=this.navParams.data.idUser;
    this.contactName=this.navParams.data.contactName;

  }

  deleteChatInDevice(){
    this.loadingService.present("Eliminando chat");
    this.dbChats=this.db.loadStore("chats");
    this.dbUser=this.db.loadStore("users");

    this.dbUser.getItem(this.idUser)
    .then(resp=>{
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
                this.router.navigate(['chat']);
              }).catch(err=>console.log(err));

            }).catch(err=>console.log(err));
          }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));
      }
    }).catch(err=>console.log(err));
  }

  blockedUserInDevice(){
    this.loadingService.present("Bloqueando usuario");
    this.dbChats=this.db.loadStore("chats");
    this.dbUser=this.db.loadStore("users");

    this.dbUser.getItem(this.idUser)
    .then(resp=>{
      if(resp){
        let blockedUsers=[this.contactName];
        if(resp.blockedUsers){
          blockedUsers=[...resp.blockedUsers, this.contactName];
        }

        this.fireStore.collection("users").doc(this.idUser)
        .update({
          blockedUsers:blockedUsers
        }).then(()=>{
          this.dbUser.setItem(this.idUser,{
            ...resp,
            blockedUsers:blockedUsers
          }).then(()=>{
            this.loadingService.dismiss();
            this.deleteChatInDevice()
          }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));
      }
    }).catch(err=>console.log(err));
  }

  async presentAlertConfirm(action:number=1) {
    let message='';
    let actionText='';

    if(action===1){
      message='¿Seguro de que desea eliminar este chat?';
      actionText='Eliminar'
    }
    else{
      message='¿Seguro de que desea bloquear este usuario? Al hacerlo también se eliminará el chat';
      actionText='BLoquear'
    }

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: message,
      buttons: [
        {
          text: 'Cancelar',
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

  deleteChat(){
    this.presentAlertConfirm(1);
  }

  blockUser(){
    this.presentAlertConfirm(2);
  }

}
