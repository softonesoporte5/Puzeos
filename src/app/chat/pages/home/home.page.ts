import { IChatData } from './../../interfaces/chat.interface';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { AngularFirestore} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { IChat} from '../../interfaces/chat.interface';
import * as firebase from 'firebase';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit{

  user:IUser;
  userSubscription:Subscription;
  chats:IChat[]=[];
  cargar:boolean=true;

  constructor(
    private menu: MenuController,
    private appService:AppService,
    private firestore:AngularFirestore,
    private sql:SqliteService
  ) { }

  ngOnInit() {

    this.sql.CreateUser(1,"Andrison","Sanchez");

    this.userSubscription=this.appService.obtenerUsuario()
    .subscribe((user:IUserData)=>{

      this.user={
        id:firebase.default.auth().currentUser.uid,
        data:{...user}
      };

      if(this.chats.length<user.chats.length){
        if(this.chats.length===0){
          this.chats=[];
          let cont=0;

          user.chats.forEach(chat=>{

            const i=cont;
            this.firestore.collection("chats").doc(chat)
            .valueChanges()
            .subscribe((resp:IChatData)=>{
              this.cargar=false;
              this.chats[i]={
                id:chat,
                data:{
                  group:resp.group,
                  lastMessage:resp.lastMessage,
                  members:resp.members,
                }
              }
            });
            cont++;
          });
        }else{
          for(let index=this.chats.length; index<user.chats.length; index++){
            this.firestore.collection("chats").doc(user.chats[index])
            .valueChanges()
            .subscribe((chat:IChatData)=>{
              this.chats[index]={
                id:user.chats[index],
                data:{
                  group:chat.group,
                  lastMessage:chat.lastMessage,
                  members:chat.members,
                }
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

