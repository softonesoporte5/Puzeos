import { DbService } from './../../../services/db.service';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { IUserData, IUser } from './../../interfaces/user.interface';
import { AppService } from './../../../app.service';
import { IChat } from './../../interfaces/chat.interface';
import { Component, Input, OnInit } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-item-chat',
  templateUrl: './item-chat.component.html',
  styleUrls: ['./item-chat.component.scss'],
})
export class ItemChatComponent implements OnInit {

  @Input("chat") chat:IChat;
  chatUser:string;
  dbUsers:any;

  constructor(
    private appService:AppService,
    private fireStore:AngularFirestore,
    private db:DbService
  ) {}

  ngOnInit() {
    this.dbUsers=this.db.cargarDB("users");
    this.dbUsers.get(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.chat.data.userNames.forEach(userName=>{
        if(userName!==user.userName){
          this.chatUser=userName;
        };
      })
      // for (const key in this.chat.data.members){
      //   if(key!==user.userName){
      //     this.chatUser=key;
      //   };
      // }
    });
    // this.appService.obtenerUsuario()
    // .subscribe((user:IUserData)=>{
    //   for (const key in this.chat.data.members){
    //     if(key!==user.userName){
    //       this.chatUser=key;
    //       // this.fireStore.collection("users").doc(key).get()
    //       // .subscribe((userChat:DocumentSnapshot<IUserData>)=>{
    //       //   this.chatUser={
    //       //     id:userChat.id,
    //       //     data:{
    //       //       ...userChat.data()
    //       //     }
    //       //   }
    //       // });
    //     };
    //   }
    // });
  }
}
