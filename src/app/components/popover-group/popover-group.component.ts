import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUserData } from './../../interfaces/user.interface';
import { StoreNames } from './../../enums/store-names.enum';
import { DbService } from './../../services/db.service';
import { LoadingService } from './../../services/loading.service';
import { ActionsUserService } from './../../services/actions-user.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { Component, OnInit } from '@angular/core';
import { NavParams, AlertController, PopoverController } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-popover-group',
  templateUrl: './popover-group.component.html',
  styleUrls: ['./popover-group.component.scss'],
})
export class PopoverGroupComponent implements OnInit {

  dbChats:ILocalForage;
  dbUser:ILocalForage;
  saved:boolean=true;
  idChat:string;
  idUser:string;
  userName:string;
  token:string;

  constructor(
    private navParams: NavParams,
    private alertController: AlertController,
    private loadingService: LoadingService,
    private db: DbService,
    private firestore: AngularFirestore,
    private popoverController: PopoverController,
    private router: Router
  ) { }

  ngOnInit() {
    this.idChat=this.navParams.data.id;
    this.idUser=this.navParams.data.idUser;
    this.userName=this.navParams.data.userName;
    this.token=this.navParams.data.token;
  }

  async deleteChat(){
    let message='';
    let actionText='';

    message='¿Seguro de que desea eliminar este chat?';
    actionText='Eliminar'

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
            this.dbChats=this.db.loadStore(StoreNames.Chats);

            this.loadingService.present("Eliminando chat");
            this.dbUser=this.db.loadStore(StoreNames.Users);

            this.dbUser.getItem(this.idUser)
            .then((resp:IUserData)=>{
              if(resp){
                let chats=resp.chats.filter(chat=>chat!==this.idChat);

                const updateObj={
                  usersData: firebase.default.firestore.FieldValue.arrayRemove({
                    id: this.idUser,
                    userName: this.userName
                  })
                };

                if(this.token){
                  updateObj["token"]=firebase.default.firestore.FieldValue.arrayRemove(this.token)
                }

                this.firestore.collection("chats").doc(this.idChat)
                .update(updateObj)
                .then(()=>{
                  this.firestore.collection("users").doc(this.idUser)
                  .update({
                    chats:chats
                  }).then(()=>{
                    this.dbChats.removeItem(this.idChat)
                    .then(()=>{
                      this.dbUser.setItem(this.idUser,{
                        ...resp,
                        chats:chats
                      }).then(()=>{
                        this.loadingService.dismiss();
                        this.popoverController.dismiss();
                        this.router.navigate(['chat'], { queryParams: { deleteChat:this.idChat}});
                      }).catch(err=>console.log(err));
                    }).catch(err=>console.log(err));
                  });
                })
              }
            }).catch(err=>console.log(err));
          }
        }
      ]
    });
    await alert.present();
  }
}
