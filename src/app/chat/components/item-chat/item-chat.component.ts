import { IChat } from './../../interfaces/chat.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-chat',
  templateUrl: './item-chat.component.html',
  styleUrls: ['./item-chat.component.scss'],
})
export class ItemChatComponent implements OnInit {

  @Input("chat") chat:IChat;
  @Input("chatUser") chatUser:string;
  chatName:string;

  constructor() {}

  ngOnInit() {
    let arrUser=this.chat.userNames.filter(userName=>userName!==this.chatName);
    this.chatName=arrUser[0];
  }
}
