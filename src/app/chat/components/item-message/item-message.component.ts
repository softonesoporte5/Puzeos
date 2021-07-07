import { ILocalForage } from './../../interfaces/localForage.interface';
import { PopoverController } from '@ionic/angular';
import { IMessage } from './../../interfaces/message.interface';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PopoverChatMessageComponent } from '../popover-chat-message/popover-chat-message.component';

@Component({
  selector: 'app-item-message',
  templateUrl: './item-message.component.html',
  styleUrls: ['./item-message.component.scss'],
})
export class ItemMessageComponent implements AfterViewInit, OnInit {

  @Input("message") message:IMessage;
  @Input("last") last?:boolean;
  @Input("content") content:HTMLElement;
  @Input("userName") userName:string;
  @Input("dbMessage") dbMessage?:ILocalForage;
  @Input("searchMessage") searchMessage?:string;
  @Input("idSearch") idSearch?:string;
  @ViewChild("messageItem") messageItem:ElementRef;

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
    if(this.idSearch!==undefined){
      if(this.idSearch===this.message.id){
        //messageTxt.indexOf(search)
        const index=this.message.message.indexOf(this.searchMessage);
        let txt1=this.message.message.substr(0,index)
        let txt2=this.message.message.substr(index,this.searchMessage.length);
        let txt3=this.message.message.substr(index+this.searchMessage.length);

        this.messageItem.nativeElement.innerHTML=`
          <span>${txt1}</span>
          <span class="resaltar">${txt2}</span>
          <span>${txt3}</span>
        `;
        setTimeout(()=>{
          this.content.querySelector(`#${this.idSearch}`).scrollIntoView();
          console.log(this.content.querySelector(`#${this.idSearch}`), this.idSearch)
          this.content.classList.add("scroll");
        },220);
      }
    }else{
      if(this.last===true){
        setTimeout(()=>{
          if(this.maxScroll-this.scrollTop<120 || this.content.scrollTop<10){
            this.content.lastElementChild.scrollIntoView(false);
          }
          this.content.classList.add("scroll");
        },220);
      }
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
