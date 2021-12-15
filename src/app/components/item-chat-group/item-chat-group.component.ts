import { DbService } from './../../services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { Component, Input, OnInit } from '@angular/core';
import { StoreNames } from 'src/app/enums/store-names.enum';
import { IGroup } from 'src/app/interfaces/group.interface';

@Component({
  selector: 'app-item-chat-group',
  templateUrl: './item-chat-group.component.html',
  styleUrls: ['./item-chat-group.component.scss'],
})
export class ItemChatGroupComponent implements OnInit {

  @Input("chat") chat:any;
  @Input("chatUser") chatUser:string;
  dbUsers:ILocalForage;
  urlImg:string="../../../../assets/person.jpg";
  dateString:string;

  constructor(
    private db:DbService
  ) {}

  ngOnInit() {
    this.dbUsers=this.db.loadStore(StoreNames.Users);
    this.chat=this.chat as IGroup;
    const date=new Date();
    const date2=new Date(this.chat.timestamp);
    if(date2.toLocaleDateString()===date.toLocaleDateString()){
      this.dateString="";
    }else{
      this.dateString=date2.toLocaleDateString();
    }

    this.urlImg=`../../../../assets/tags-img/${this.chat.title.replace(/ /g,'-').replace(':','')}.jpg`;
  }
}
