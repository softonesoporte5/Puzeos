import { ChatService } from './../../pages/chat/chat.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IonContent, PopoverController } from '@ionic/angular';
import { IMessage } from './../../interfaces/message.interface';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PopoverChatMessageComponent } from '../popover-chat-message/popover-chat-message.component';

@Component({
  selector: 'app-item-message',
  templateUrl: './item-message.component.html',
  styleUrls: ['./item-message.component.scss'],
})
export class ItemMessageComponent implements AfterViewInit, OnInit
{

  @Input("message") message:IMessage;
  @Input("idChat") idChat:string;
  @Input("last") last?:boolean;
  @Input("content") content:IonContent;
  @Input("userName") userName:string;
  @Input("dbMessage") dbMessage?:ILocalForage;
  @Input("searchMessage") searchMessage?:string;
  @Input("idSearch") idSearch?:string;
  @ViewChild("messageItem") messageItem:ElementRef;

  maxScroll:number;
  scrollTop:number;
  lastDate:Date;
  showDate=false;
  stringDate:string;

  constructor(
    private popoverController: PopoverController,
    private chatService:ChatService
  ) {}

  ngOnInit() {
    this.lastDate=this.chatService.lastDate;

    if(this.message.timestamp.toDateString()!==this.lastDate){
      this.chatService.setLastDate(this.message.timestamp.toDateString());
      this.showDate=true;
      const date=new Date();
      if(this.message.timestamp.toLocaleDateString()===date.toLocaleDateString()){
        this.stringDate="Hoy";
      }else{
        this.stringDate=this.message.timestamp.toLocaleDateString();
      }
    }
  }

  ngAfterViewInit() {
    if(this.idSearch!==undefined){
      if(this.idSearch===this.message.id){
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
          document.querySelector(`#${this.idSearch}`).scrollIntoView();
        },220);
      }
    }else{
      if(this.last===true){
        this.content.getScrollElement()
        .then(resp=>{
          setTimeout(()=>{
            let maxScroll=resp.scrollHeight-resp.offsetHeight;
            let scrollTop=resp.scrollTop;

            if(maxScroll-scrollTop<120 || resp.scrollTop<10){
              this.content.scrollToBottom();
            }
          },220);
        })
      }
    }

    let scrollText=document.querySelector(`#${this.message.id} ion-card-content > span`);
    //console.log(scrollText.clientHeight,scrollText.scrollHeight)
    if(scrollText.clientHeight!==scrollText.scrollHeight){

      scrollText.classList.add("put-text");
    }
  }

  async presentPopoverMessage(ev: any,message:IMessage) {
    const popover = await this.popoverController.create({
      component: PopoverChatMessageComponent,
      event: ev,
      componentProps:{"message":message,"idChat":this.idChat}
    });
    return await popover.present();
  }

  scrollToReply(){
    this.chatService.scrollReply$.next(this.message.reply.id);
  }

  reply(){
    this.chatService.replyMessage$.next(this.message);
  }

}
