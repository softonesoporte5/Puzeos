import { AppService } from './../../../app.service';
import { IChat } from './../../interfaces/chat.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-chat',
  templateUrl: './item-chat.component.html',
  styleUrls: ['./item-chat.component.scss'],
})
export class ItemChatComponent implements OnInit {

  @Input() chat:IChat;
  chatUser:string='';


  constructor(
    private appService:AppService
  ) { }

  ngOnInit() {
    this.appService.obtenerUsuario()
    .subscribe(user=>{
      for (const key in this.chat.data.members) {
        if(key!==user.id)this.chatUser=key;

      }
    });
  }

}
