import { ILocalForage } from './../../interfaces/localForage.interface';
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
  @Input("chatUser") chatUser:string;
  dbUsers:ILocalForage;

  constructor(
    private db:DbService
  ) {}

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");
  }
}
