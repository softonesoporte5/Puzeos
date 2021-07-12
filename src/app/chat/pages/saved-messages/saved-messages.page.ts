import { IMessage, IMessageSearch } from './../../interfaces/message.interface';
import { DbService } from 'src/app/services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-saved-messages',
  templateUrl: './saved-messages.page.html',
  styleUrls: ['./saved-messages.page.scss'],
})
export class SavedMessagesPage implements OnInit {

  dbSavedMessage:ILocalForage;
  messages:IMessageSearch[]=[];

  constructor(
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbSavedMessage=this.db.loadStore("savedMessages");

    this.dbSavedMessage.iterate(values=>{
      this.messages.push(values);
    }).then(()=>console.log("completo"))
    .catch(error=>{
      console.log(error);
    });
  }

}
