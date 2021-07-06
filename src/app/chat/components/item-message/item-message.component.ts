import { ILocalForage } from './../../interfaces/localForage.interface';
import { PopoverController } from '@ionic/angular';
import { IMessage } from './../../interfaces/message.interface';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { PopoverChatMessageComponent } from '../popover-chat-message/popover-chat-message.component';

@Component({
  selector: 'app-item-message',
  templateUrl: './item-message.component.html',
  styleUrls: ['./item-message.component.scss'],
})
export class ItemMessageComponent implements AfterViewInit, OnInit {

  @Input("message") message:IMessage;
  @Input("last") last:boolean;
  @Input("content") content:HTMLElement;
  @Input("userName") userName:string;
  @Input("dbMessage") dbMessage?:ILocalForage;
  maxScroll:number;
  scrollTop:number;

  constructor(
    private popoverController: PopoverController
  ) {}
  ngOnInit() {
    if(this.last===true){
      this.maxScroll=this.content.scrollHeight-this.content.offsetHeight;
      this.scrollTop=this.content.scrollTop;
    }
  }

  ngAfterViewInit() {
    if(this.last===true){
      setTimeout(()=>{
        if(this.maxScroll-this.scrollTop<120 || this.content.scrollTop<10){
          this.content.lastElementChild.scrollIntoView(false);
        }
        this.content.classList.add("scroll");
      },200);
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
