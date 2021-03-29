import { AppService } from './../../../app.service';
import { IChatData } from './../../interfaces/chat.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-chat',
  templateUrl: './item-chat.component.html',
  styleUrls: ['./item-chat.component.scss'],
})
export class ItemChatComponent implements OnInit {

  @Input() chat:IChatData;
  chatUser:string='';


  constructor(
    private appService:AppService
  ) { }

  ngOnInit() {
    console.log(this.chat);
    this.appService.obtenerUsuario()
    .subscribe(user=>{
      for (const key in this.chat.members) {
        if(key!==user.id)this.chatUser=key;

      }
    });
  }

}
