import { IChat } from './../../interfaces/chat.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IUser } from './../../interfaces/user.interface';
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

      if(this.chatsFirebase<this.user?.data?.chats?.length){
        if(this.chatsFirebase===0){
          let cont=0;
          this.user.data.chats.forEach(chat=>{
            this.firestore.collection("chats").doc(chat)
            .valueChanges()
            .subscribe((resp:IChat)=>{
              //Insertamos/actualizamos en la bd local
              console.log(resp);
              this.dbChats.setItem(chat,{
                group:resp.group,
                lastMessage:resp.lastMessage,
                members:resp.members,
                userNames:resp.userNames,
                timestamp:resp.timestamp.toDate()
              }).catch(err=>console.log(err))

              this.chatsObj[chat]={
                ...resp,
                id:chat,
                timestamp:resp.timestamp.toDate()
              }

              this.orderChats();
            });
            cont++;
            this.chatsFirebase=this.chatsFirebase+1;
          });
        }else{console.log("D")
          for(let index=this.chats.length; index<user.chats.length; index++){
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

              this.chatsObj[user.chats[index]]={
                ...chat,
                id:user.chats[index],
                timestamp:chat.timestamp.toDate()
              }
              this.orderChats();
            });
          }
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

