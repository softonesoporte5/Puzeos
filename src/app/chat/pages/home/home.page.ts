import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { AngularFirestore} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import * as firebase from 'firebase';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit{

  user:IUser;
  userSubscription:Subscription;
  chats={};
  chatsFirebase:number=0;
  dbChats:ILocalForage;
  dbUsers:ILocalForage;

  constructor(
    private menu: MenuController,
    private appService:AppService,
    private firestore:AngularFirestore,
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbChats=this.db.loadStore('chats');
    this.dbUsers=this.db.loadStore("users");

    let cont=0;
    this.dbChats.iterate((values,key)=>{
      this.chats[key]={
        id:key,
        ...values
      }
      cont++;
    }).catch(err=>console.log(err));

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };
      this.appService.obtenerUsuario()
      .subscribe(user=>{
        console.log(user);
        this.user={
          id:firebase.default.auth().currentUser.uid,
          data:{...user}
        };

        if(this.chatsFirebase<this.user?.data?.chats?.length){
          if(this.chatsFirebase===0){console.log("prueba")
            let cont=0;
            this.user.data.chats.forEach(chat=>{
              const i=cont;
              this.firestore.collection("chats").doc(chat)
              .valueChanges()
              .subscribe((resp:IChat)=>{
                //Insertamos/actualizamos en la bd local
                this.dbChats.setItem(chat,{
                  group:resp.group,
                  lastMessage:resp.lastMessage,
                  members:resp.members,
                  userNames:resp.userNames,
                  timestamp:resp.timestamp.toDate()
                }).catch(err=>console.log(err))

                this.chats[chat]={
                  id:chat,
                  group:resp.group,
                  lastMessage:resp.lastMessage,
                  members:resp.members,
                  userNames:resp.userNames,
                  timestamp:resp.timestamp.toDate()
                }
              });
              cont++;
              this.chatsFirebase=this.chatsFirebase+1;
            });console.log("orden")
            this.orderChats(this.chats);

          }else{
            for(let index=Object.keys(this.chats).length; index<user.chats.length; index++){
              this.firestore.collection("chats").doc(user.chats[index])
              .valueChanges()
              .subscribe((chat:IChat)=>{

                this.dbChats.setItem(user.chats[index],{
                  group:chat.group,
                  lastMessage:chat.lastMessage,
                  members:chat.members,
                  userNames:chat.userNames,
                  timestamp:chat.timestamp.toDate()
                }).catch(err=>console.log(err));

                this.chats[chat.id]={
                  id:user.chats[index],
                  group:chat.group,
                  lastMessage:chat.lastMessage,
                  members:chat.members,
                  userNames:chat.userNames,
                  timestamp:chat.timestamp.toDate()
                }
              });
            }
            console.log(this.chats);
          }
        }
     });
    });
  }

  openMenu(){
    const open=async()=> {
      await this.menu.open();
    }
    open();
  }

  orderChats(chats:{}){
    let chatsArr=[];
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

    let chatsObject={};

    for (let index = chatsArr.length; index > chatsArr.length; index--) {
      chatsObject[chatsArr[index].id]=chatsArr[index];
    }

    chatsArr.forEach((chat:IChat)=>{
      chatsObject[chat.id]=chat;
    });

    console.log(chatsArr);
    console.log(chatsObject);

    this.chats=chatsObject;
  }
}

