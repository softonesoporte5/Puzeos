import { Subscription } from 'rxjs';
import { IMessage } from './../../interfaces/message.interface';
import { FileSystemService } from './../../services/file-system.service';
import { IChat } from './../../interfaces/chat.interface';
import { ActionsUserService } from './../../services/actions-user.service';
import { AppService } from './../../app.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { FirebaseStorageService } from './../../services/firebase-storage.service';
import { DbService } from 'src/app/services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUserData } from './../../interfaces/user.interface';
import { ModalController, NavParams } from '@ionic/angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Capacitor } from '@capacitor/core';

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
  storageSubscribe:Subscription;
  httpSubscribe:Subscription;

  constructor(
    private navParams:NavParams,
    private modalController:ModalController,
    private firestore:AngularFirestore,
    private firebaseStorageService:FirebaseStorageService,
    private http:HttpClient,
    private appService:AppService,
  ) { }

  ngOnInit() {
    this.userId=this.navParams.get("userId");

    this.firestore.collection("users")
    .doc(this.userId)
    .get()
    .subscribe(resp=>{
      this.user=resp.data() as IUserData;
      this.user.createDate=this.user.createDate.toDate();
      if(!this.user.imageUrl){
        this.imgPath='assets/avatar/avatar_'+this.user.avatarId+'.jpg'
      }else{
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
                this.imgPath=result as string;
              }).catch(err=>console.log(err));
            }
          });
        });
      }
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
}
