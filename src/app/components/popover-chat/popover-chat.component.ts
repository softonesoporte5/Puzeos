import { ActionsUserService } from './../../services/actions-user.service';
import { ILocalForage } from './../../chat/interfaces/localForage.interface';
import { Component, OnInit } from '@angular/core';
import { NavParams} from '@ionic/angular';

@Component({
  selector: 'app-popover-chat',
  templateUrl: './popover-chat.component.html',
  styleUrls: ['./popover-chat.component.scss'],
})
export class PopoverChatComponent implements OnInit {

  dbChats:ILocalForage;
  dbUser:ILocalForage;
  saved:boolean=true;
  idChat:string;
  contactName:string;

  constructor(
    private navParams: NavParams,
    private actionsUserService:ActionsUserService
  ) { }

  ngOnInit() {
    this.idChat=this.navParams.data.id;
    this.contactName=this.navParams.data.contactName;
  }

  deleteChat(){
    this.actionsUserService.presentAlertConfirm(1,this.idChat,this.contactName);
  }

  blockUser(){
    this.actionsUserService.presentAlertConfirm(2,this.idChat,this.contactName);
  }

}
