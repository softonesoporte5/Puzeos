import { ILocalForage } from './../../interfaces/localForage.interface';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { AngularFirestore} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { IChat} from '../../interfaces/chat.interface';
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


  constructor(
    private menu: MenuController,
    private appService:AppService,
    private firestore:AngularFirestore,
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbChats=this.db.loadStore('chats');
    let cont=0;
    this.dbChats.iterate((values,key,iterationNumber)=>{
      this.chats[cont]={
        id:key,
        ...values
      }
      cont++;
    }).catch(err=>console.log(err));

    this.appService.obtenerUsuario()
    .then((user:IUserData)=>{
      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };

      if(this.chatsFirebase<this.user?.data?.chats?.length){
        if(this.chatsFirebase===0){
          let cont=0;
          console.log("f")
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
                userNames:resp.userNames
              }).catch(err=>console.log(err))

              this.chats[i]={
                id:chat,
                group:resp.group,
                lastMessage:resp.lastMessage,
                members:resp.members,
                userNames:resp.userNames
              }
            });
            cont++;
            this.chatsFirebase=this.chatsFirebase+1;
          });
        }else{
          for(let index=this.chats.length; index<user.chats.length; index++){
            this.firestore.collection("chats").doc(user.chats[index])
            .valueChanges()
            .subscribe((chat:IChat)=>{

              this.dbChats.setItem(user.chats[index],{
                group:chat.group,
                lastMessage:chat.lastMessage,
                members:chat.members,
                userNames:chat.userNames
              }).catch(err=>console.log(err))

              this.chats[index]={
                id:user.chats[index],
                group:chat.group,
                lastMessage:chat.lastMessage,
                members:chat.members,
                userNames:chat.userNames
              }
            })
          }
        }
      }
   });
  }

  openMenu(){
    const open=async()=> {
      await this.menu.open();
    }
    open();
  }

}

