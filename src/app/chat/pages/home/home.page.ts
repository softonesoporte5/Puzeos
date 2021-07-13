import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IUser } from './../../interfaces/user.interface';
import { AngularFirestore, DocumentChange, DocumentSnapshot } from '@angular/fire/firestore';
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
  newMessages=0;
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
      this.chatsFirebase++;
    }).then(()=>{
      this.orderChats();
      this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
      .then(user=>{
        this.user={
          id:firebase.default.auth().currentUser.uid,
          data:{...user}
        };
        this.db.getUser$()
        .subscribe(user=>{
          console.log(user)
          this.user={
            id:firebase.default.auth().currentUser.uid,
            data:{...user}
          };

          if(this.chatsFirebase<user.chats.length){
            this.chatsFirebase++;
            this.firestore.collection("chats").doc(user.chats[user.chats.length-1])
            .get()
            .subscribe((resp:DocumentSnapshot<IChat>)=>{
              //Insertamos/actualizamos en la bd local
              const data=resp.data() as IChat;
              const chatData:IChat={
                id:resp.id,
                group:data.group,
                lastMessage:data.lastMessage,
                members:data.members,
                userNames:data.userNames,
                timestamp:data.timestamp.toDate()
              }
              this.db.setItemChat(resp.id,chatData)

              /*this.chatsObj[chat]={
                ...resp,
                id:chat,
                timestamp:resp.timestamp.toDate()
              }*/

              this.orderChats();
            });
          }//cierre
        });
      }).catch(err=>console.log(err))

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
        console.log(this.chatsFirebase,this.user?.data?.chats?.length)
        if(this.chatsFirebase<this.user?.data?.chats?.length){
            for(let index=this.chats.length; index<user.chats.length; index++){
              this.firestore.collection("chats").doc(user.chats[index])
              .valueChanges()
              .subscribe((chat:IChat)=>{

                this.dbChats.setItem(user.chats[index],{
                  ...chat,
                  timestamp:chat.timestamp.toDate()
                }).catch(err=>console.log(err));

                this.chatsObj[user.chats[index]]={
                  ...chat,
                  id:user.chats[index],
                  timestamp:chat.timestamp.toDate()
                }
                this.orderChats();
              });
            }
            this.chatsFirebase=this.chatsFirebase+1;
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

