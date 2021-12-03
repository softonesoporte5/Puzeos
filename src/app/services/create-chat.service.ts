import { ToastService } from './toast.service';
import { LoadingService } from './loading.service';
import { StoreNames } from './../enums/store-names.enum';
import { DbService } from './db.service';
import { ILocalForage } from './../interfaces/localForage.interface';
import { Router } from '@angular/router';
import { IUser } from './../interfaces/user.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class CreateChatService {

  dbUsers:ILocalForage;

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private db: DbService,
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {
    this.dbUsers=this.db.loadStore(StoreNames.Users);
  }

  createGroup(tagId:string, user:IUser, title:string){
    this.loadingService.present();
    const ref=this.firestore.collection("chats").doc(tagId);
    ref.update({
      usersData:firebase.default.firestore.FieldValue.arrayUnion({
        id: user.id,
        userName:user.data.userName,
        compressImage: user.data.compressImage?user.data.compressImage:'',
        avatarId: user.data.avatarId?user.data.avatarId: 0
      }),
      tokens:firebase.default.firestore.FieldValue.arrayUnion(user.data.token),
      lastMessage: user.data.userName+' has joined the chat'
    }).then(()=>{
      this.firestore.collection("users").doc(user.id)
      .update({
        chats:firebase.default.firestore.FieldValue.arrayUnion(tagId)
      }).then(()=>{
        user.data.chats.push(tagId);
        this.updateLocalUser(user);
        this.loadingService.dismiss();
        this.router.navigate(['chat']);
      }, ()=>this.errorMessage())
    },err=>{
      ref.set({
        title: title,
        usersData:[{
          id: user.id,
          userName:user.data.userName,
          compressImage: user.data.compressImage?user.data.compressImage:'',
          avatarId: user.data.avatarId?user.data.avatarId: 0
        }],
        timestamp: firebase.default.firestore.FieldValue.serverTimestamp(),
        tokens:[user.data.token],
        lastMessage: user.data.userName+' has joined the chat',
        group: true
      }).then(()=>{
        this.firestore.collection("users").doc(user.id)
        .update({
          chats:firebase.default.firestore.FieldValue.arrayUnion(tagId)
        }).then(()=>{
          user.data.chats.push(tagId);
          this.updateLocalUser(user);
          this.loadingService.dismiss();
          this.router.navigate(['chat']);
        }, ()=>this.errorMessage());
      }, ()=>this.errorMessage())
    });
  }

  updateLocalUser(user:IUser){
    this.dbUsers.setItem(user.id,user.data)
    .catch(err=>console.log(err));
  }

  private errorMessage(){
    this.loadingService.dismiss();
    this.toastService.presentToast('Error al tratar de ingresar al grupo.');
  }
}
