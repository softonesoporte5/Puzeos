import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IUser } from './../../interfaces/user.interface';
import { AngularFirestore, DocumentChange } from '@angular/fire/firestore';
import { Subscription, Subject } from 'rxjs';
import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import * as firebase from 'firebase';
import { DbService } from 'src/app/services/db.service';
import { IMessage } from '../../interfaces/message.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit{

  user:IUser;
  userSubscription:Subscription;
  chats:IChat[]=[];
  chatsFirebase:number=0;
  dbChats:ILocalForage;
  dbUsers:ILocalForage;
  chatsObj={};

  constructor(
    private menu: MenuController,
    private appService:AppService,
    private firestore:AngularFirestore,
    private db:DbService
  ) { }

  ngOnInit() {

    this.dbChats=this.db.loadStore('chats');
    this.dbUsers=this.db.loadStore("users");
    this.dbChats.iterate((values,key)=>{
      this.chatsObj[key]={
        id:key,
        ...values
      }
    }).then(()=>{
      this.orderChats();
      //Nos subscribimos a los chats de manera local
      this.db.getItemsChat()
      .subscribe(resp=>{
        let chat=resp as IChat;
        this.chatsObj[chat.id]={
          ...chat
        }
        this.orderChats();
      });
    })
    .catch(err=>console.log(err));

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };
      this.appService.obtenerUsuario()
      .subscribe(user=>{
        this.user={
          id:firebase.default.auth().currentUser.uid,
          data:{...user}
        };
      });
    });
  }

  openMenu(){
    const open=async()=> {
      await this.menu.open();
    }
    open();
  }

  orderChats(){
    let chatsArr=[];
    const chats={...this.chatsObj};
    for (let property in chats) {
      chatsArr.push({...chats[property],timestamp:chats[property].timestamp.valueOf()});
    }

    chatsArr=chatsArr.sort(function (a, b) {
      if (a.timestamp < b.timestamp) {
        return 1;
      }
      if (a.timestamp > b.timestamp) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    this.chats=chatsArr;
  }
}

