import { IChat } from './../../interfaces/chat.interface';
import { ActionsUserService } from './../../../services/actions-user.service';
import { AppService } from './../../../app.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { ModalController, NavParams } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Capacitor, Plugins, FilesystemDirectory } from '@capacitor/core';
const {Filesystem} = Plugins;

@Component({
  selector: 'app-perfil-modal',
  templateUrl: './perfil-modal.component.html',
  styleUrls: ['./perfil-modal.component.scss'],
})
export class PerfilModalComponent implements OnInit {

  user:IUser;
  imgPath:string;
  dbUsers:ILocalForage;
  chat:IChat;

  constructor(
    private navParams:NavParams,
    private modalController:ModalController,
    private firestore:AngularFirestore,
    private db:DbService,
    private firebaseStorageService:FirebaseStorageService,
    private http:HttpClient,
    private appService:AppService,
    private actionsUserService:ActionsUserService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");

    this.firestore.collection("users")
    .doc(this.user.id)
    .get()
    .subscribe(resp=>{
      const userData=resp.data() as IUserData;
      if(!userData.imageUrl){
        const date=new Date(userData.createDate.toDate());
        this.dbUsers.setItem(this.user.id,{
          ...userData,
          createDate:date.valueOf()
        });
        this.imgPath="assets/person.jpg";
      }else{
        if(userData.imageUrl!==this.user.data.imageUrl){

          let storageSubscribe=this.firebaseStorageService.getUrlFile(userData.imageUrl)
          .subscribe(downloadUrl=>{
            let httpSubscribe=this.http.get(downloadUrl,{
              responseType:'blob',
              observe:'events'
            }).subscribe(async event=>{
              if(event.type===HttpEventType.Response){
                let base64;
                const date=new Date().valueOf();
                const randomId=Math.round(Math.random()*1000)+date;
                const reader=new FileReader;

                this.appService.convertBlobToBase64(event.body)
                .then((result:string | ArrayBuffer)=>{
                  base64=result;
                  Filesystem.writeFile({
                    path:randomId+'.jpeg',
                    data:base64,
                    directory:FilesystemDirectory.Data
                  }).then(resp=>{
                    this.dbUsers.setItem(this.user.id,{
                      ...userData,
                      imageUrlLoc:resp.uri
                    }).then(()=>{
                      this.imgPath=Capacitor.convertFileSrc(resp.uri);

                      storageSubscribe.unsubscribe();
                      httpSubscribe.unsubscribe();
                    })
                  }).catch(err=>console.log(err));
                }).catch(err=>console.log(err));
              }
            });
          })
        }
      }
    })

    this.user=this.navParams.get("user");
    this.chat=this.navParams.get("chat");

    if(this.user.data.imageUrlLoc){
      this.imgPath=Capacitor.convertFileSrc(this.user.data.imageUrlLoc);
    }else{
      this.imgPath="assets/person.jpg";
    }
  }

  close(){
    this.modalController.dismiss();
  }

  blockUser(){
    this.actionsUserService.presentAlertConfirm(2,this.chat.id,this.user.data.userName);
  }

}
