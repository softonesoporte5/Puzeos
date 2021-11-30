import { ChatService } from '../../services/chat.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IonContent, PopoverController } from '@ionic/angular';
import { IMessage } from './../../interfaces/message.interface';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PopoverChatMessageComponent } from '../popover-chat-message/popover-chat-message.component';
import { IGroup } from 'src/app/interfaces/group.interface';

@Component({
  selector: 'app-item-message-group',
  templateUrl: './item-message-group.component.html',
  styleUrls: ['./item-message-group.component.scss'],
})
export class ItemMessageGroupComponent implements AfterViewInit, OnInit {

  @Input("message") message:IMessage;
  @Input("idChat") idChat:string;
  @Input("last") last?:boolean;
  @Input("content") content:IonContent;
  @Input("userId") userId:string;
  @Input("dbChat") dbChat?:ILocalForage;
  @Input("searchMessage") searchMessage?:string;
  @Input("idSearch") idSearch?:string;
  @ViewChild("messageItem") messageItem:ElementRef;
  maxScroll:number;
  scrollTop:number;
  lastDate:Date;
  showDate=false;
  stringDate:string;
  beforeMessage=false;
  imgRef='../../../assets/person.jpg';

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
    if(this.chatService.beforeMessage===this.message.toUserId){
      this.beforeMessage=true;
    }else{
      this.dbChat.getItem(this.idChat).then((resp:IGroup)=>{
        for(let i=0;i<resp.usersData.length;i++){
          if(resp.usersData[i].id===this.message.toUserId){
            if(resp.usersData[i].avatarId){
              if(resp.usersData[i].avatarId!==0){
                this.imgRef=resp.usersData[i].compressImage;
              }else{
                this.imgRef='../../../assets/avatar/avatar_'+resp.usersData[i].avatarId+'.jpg';
              }
            }else{
              this.imgRef='../../../assets/person.jpg';
            }
            break;
          }
        }
      });
      this.chatService.beforeMessage=this.message.toUserId;
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
          document.querySelector(`#e${this.idSearch}`).scrollIntoView();
        },220);
      }
    }else{
      if(this.last===true){
        this.content.getScrollElement()
        .then(resp=>{
          setTimeout(()=>{
            let maxScroll=resp.scrollHeight-resp.offsetHeight;
            let scrollTop=resp.scrollTop;

            if(maxScroll-scrollTop<120 || resp.scrollTop<10 || this.userId===this.message.toUserId){
              this.content.scrollToBottom();
            }
          },220);
        })
      }
    }

    let scrollText=document.querySelector(`#e${this.message.id} ion-card-content > span`);
    //console.log(scrollText.clientHeight,scrollText.scrollHeight)
    if(scrollText.clientHeight!==scrollText.scrollHeight){
      scrollText.classList.add("put-text");
    }
  }

  async presentPopoverMessage(ev: any,message:IMessage) {
    const popover = await this.popoverController.create({
      component: PopoverChatMessageComponent,
      event: ev,
      componentProps:{
        "message":message,
        "idChat":this.idChat,
        "group": true
      }
    });
    return await popover.present();
  }

  scrollToReply(){
    this.chatService.scrollReply$.next(this.message.reply.id);
  }

  reply(){
    this.chatService.replyMessage$.next(this.message);
  }

  cardClass(){
    let classNames = "";

    if(this.userId===this.message.toUserId){
      classNames+="enviado ";
    }

    if(this.beforeMessage){
      classNames+="loc__sequence-message";
    }

    return classNames;
  }

}
