import { ILocalForage } from './../../interfaces/localForage.interface';
import { PopoverController } from '@ionic/angular';
import { IMessage } from './../../interfaces/message.interface';
import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { PopoverChatMessageComponent } from '../popover-chat-message/popover-chat-message.component';

@Component({
  selector: 'app-item-message',
  templateUrl: './item-message.component.html',
  styleUrls: ['./item-message.component.scss'],
})
export class ItemMessageComponent implements AfterViewChecked, OnInit {

  @Input("message") message:IMessage;
  @Input("last") last:boolean;
  @Input("content") content:HTMLElement;
  @Input("userName") userName:string;
  @Input("dbMessage") dbMessage?:ILocalForage;

  constructor(
    private popoverController: PopoverController
  ) {}
  ngOnInit() {
    if(this.last===true){
      console.log("b")
    }
  }

  ngAfterViewChecked() {
    if(this.last===true){
      this.content.lastElementChild.scrollIntoView(false);
    }
  }

  async presentPopoverMessage(ev: any,message:IMessage) {
    const popover = await this.popoverController.create({
      component: PopoverChatMessageComponent,
      event: ev,
      componentProps:{"message":message}
    });
    return await popover.present();
  }

}
