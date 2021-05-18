import { DbService } from './../../../services/db.service';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
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
      console.log(this.chat)
      this.chat.data.userNames.forEach(userName=>{
        if(userName!==user.userName){
          this.chatUser=userName;
        };
      })
    });
  }
}
