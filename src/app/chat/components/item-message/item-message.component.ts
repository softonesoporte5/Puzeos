import { ILocalForage } from './../../interfaces/localForage.interface';
import { PopoverController } from '@ionic/angular';
import { IMessage } from './../../interfaces/message.interface';
import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, Input } from '@angular/core';
import { PopoverChatMessageComponent } from '../popover-chat-message/popover-chat-message.component';

@Component({
  selector: 'app-item-message',
  templateUrl: './item-message.component.html',
  styleUrls: ['./item-message.component.scss'],
})
export class ItemMessageComponent implements AfterViewChecked {

  @Input("message") message:IMessage;
  @Input("userName") userName:string;
  @Input("dbMessage") dbMessage:ILocalForage;
  @Input("content") content:HTMLElement;
  cont=0;

  constructor(
    private popoverController: PopoverController
  ) {}

  ngAfterViewChecked() {
    if(this.cont===0){
      this.content.lastElementChild.scrollIntoView(false);
      this.cont++;
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
