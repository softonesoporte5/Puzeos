import { PopoverGroupComponent } from './../../../components/popover-group/popover-group.component';
import { PluginListenerHandle, Plugins, KeyboardInfo } from '@capacitor/core';
import { PerfilModalComponent } from './../../../components/perfil-modal/perfil-modal.component';
import { IMessagesResp } from './../../../interfaces/messagesResp.interface';
import { IUser } from './../../../interfaces/user.interface';
import { ILocalForage } from './../../../interfaces/localForage.interface';
import { IMessage } from './../../../interfaces/message.interface';
import { Subscription, Subject } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { DbService } from 'src/app/services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import * as firebase from 'firebase';
import { PopoverController, ModalController, IonContent, IonTextarea } from '@ionic/angular';
import { StoreNames } from 'src/app/enums/store-names.enum';
import { IGroup } from 'src/app/interfaces/group.interface';

import { Platform } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { GroupInfoModalComponent } from 'src/app/components/group-info-modal/group-info-modal.component';
const { Keyboard } = Plugins;

@Component({
  selector: 'app-chat-group',
  templateUrl: './chat-group.page.html',
  styleUrls: ['./chat-group.page.scss'],
})
export class ChatGroupPage implements OnInit, OnDestroy, AfterViewInit {

  idChat:string;
  userName:string='';
  dbChat:ILocalForage;
  chat:IGroup;
  dbUsers:ILocalForage;
  mensajes:IMessage[]=[];
  mensajesSubscribe:Subscription;
  scrollReplySubscribe:Subscription;
  showScrollButton=false;
  routeQuery:Params;
  user:IUser;
  imgPath:string;
  @ViewChild('content') content: IonContent;
  replyMessage:IMessage;
  showEmojiPicker:boolean=false;
  emojiPickerHeight=300;
  resetPosEmoji:boolean=true;
  posEmoji:number=0;
  KeyboardListener:PluginListenerHandle;
  replySubscribe:Subscription;
  @ViewChild('textarea') textarea: IonTextarea;
  miFormulario:FormGroup=this.fb.group({
    mensaje:['',[Validators.required,Validators.minLength(1)]]
  });
  mensaje:AbstractControl=this.miFormulario.get("mensaje");

  constructor(
    private route:ActivatedRoute,
    private firestore:AngularFirestore,
    private popoverController: PopoverController,
    private db:DbService,
    private chatService:ChatService,
    private modal:ModalController,
    private fb:FormBuilder,
    private ref: ChangeDetectorRef,
    private platform: Platform
  ) { }

  ngOnInit(){
    this.dbUsers=this.db.loadStore(StoreNames.Users);
    this.idChat=this.route.snapshot.paramMap.get("id");
    this.dbChat=this.db.loadStore(StoreNames.Chats);

    this.route.queryParams
    .subscribe(params => {
      this.routeQuery=params;
    });

    this.dbChat.getItem(this.idChat)
    .then((chat:IGroup)=>{
      this.chat=chat;
      this.imgPath='../../../../assets/tags-img/'+this.chat.title.replace(/ /g,'-').replace(':','')+'.jpg';
    }).catch(err=>console.log(err));

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(user=>{
      this.user={
        id: firebase.default.auth().currentUser.uid,
        data: user
      };

      if(this.db.messagesSubscriptions){
        try{
          const messages=this.db.messagesSubscriptions[this.idChat] as Subject<IMessagesResp>;
          this.subscribeMessages(messages);
        }catch(e){
          let mInterval=setInterval(()=>{
            let messagesCon;
            console.log(messagesCon)
            if(messagesCon){
              clearInterval(mInterval);
            }else{
              messagesCon=this.db.messagesSubscriptions[this.idChat] as Subject<IMessagesResp>;
              this.subscribeMessages(messagesCon);
            }
          },2000);
        }
      }
    }).catch(err=>console.log(err));

    this.scrollReplySubscribe=this.chatService.scrollReply$.subscribe(resp=>{
      this.chatService.scrollReply(this.mensajes, resp, true);
    });

    this.replySubscribe=this.chatService.replyMessage$.subscribe(resp=>{
      this.replyMessage=resp;
    });

    Keyboard.addListener("keyboardDidShow",(info: KeyboardInfo)=>{
      this.emojiPickerHeight=info.keyboardHeight;
      this.showEmojiPicker=false;
      this.ref.detectChanges();
    });

    this.platform.backButton.subscribeWithPriority(10, processNextHandler => {
      if(this.showEmojiPicker){
        this.showEmojiPicker=false;
        this.ref.detectChanges();
      }else{
        processNextHandler();
      }
    });

    this.firestore.collection("chats").doc(this.idChat)
    .get()
    .subscribe((resp)=>{
      const chat=resp.data() as IGroup;

      this.dbChat.getItem(this.idChat)
      .then((resp:IGroup)=>{
        this.dbChat.setItem(this.idChat,{
          ...resp,
          tokens: chat.tokens,
          usersData: chat.usersData
        })
      })
    });
  }

  ngAfterViewInit(){
    this.content.getScrollElement()
    .then(resp=>{
      resp.addEventListener("scroll",e=>this.scrollEvent(e));
    });
  }

  ngOnDestroy(){
    if(this.mensajesSubscribe){
      this.mensajesSubscribe.unsubscribe();
    }
    if(this.scrollReplySubscribe){
      this.scrollReplySubscribe.unsubscribe();
    }

    if(this.replySubscribe){
      this.replySubscribe.unsubscribe();
    }
    if(this.KeyboardListener){
      this.KeyboardListener.remove();
    }
  }

  addEmoji(event:any) {
    const textArea=document.querySelector(".native-textarea") as HTMLInputElement;
    let end = textArea.selectionEnd;
    if(this.resetPosEmoji){
      this.posEmoji=end;
    }else{
      this.posEmoji+=2;
      end=this.posEmoji;
    }
    this.resetPosEmoji=false;
    this.mensaje.setValue(this.mensaje.value.substr(0,end)+event.data+this.mensaje.value.substr(end));
  }

  toogleEmojiPicker(){
    if(this.showEmojiPicker){
      this.textarea.setFocus();
    }
    this.showEmojiPicker=!this.showEmojiPicker;
  }

  agregarMensaje(){
    if(this.mensaje.value.trim()){
      const message=this.mensaje.value;
      this.textarea.setFocus();
      const newMessage={
        message:message,
        user:this.user.data.userName,
        type:"text",
        sendToToken: this.chat.tokens || "",
        toUserId:this.user.id,
        id: this.user.id,
        idChat: this.idChat,
        color: localStorage.getItem("messagesColor")
      }

      if(this.replyMessage){
        newMessage["reply"]=this.replyMessage;
      }

      const timestamp=firebase.default.firestore.FieldValue.serverTimestamp();
      this.firestore.collection("messages").doc(this.idChat)
      .collection("messages").add({
        ...newMessage,
        timestamp:timestamp
      }).catch(err=>{
        console.log(err, newMessage)
      })

      this.mensaje.setValue('');
      this.textarea.setFocus();
      this.replyMessage=null;
    }
  }

  deleteReply(){
    this.replyMessage=null;
  }

  subscribeMessages(messages:Subject<IMessagesResp>){
    this.mensajes=this.db.arrMessages[this.idChat];
    this.mensajesSubscribe=messages.subscribe(()=>{
      const messages=this.db.arrMessages[this.idChat];
      this.mensajes=messages;
    })
  }

  async presentPopover(ev: any) {

    const popover = await this.popoverController.create({
      component: PopoverGroupComponent,
      componentProps:{
        "id":this.idChat,
        "idUser":this.user.id,
        "userName":this.user.data.userName,
        "token": this.user.data.token
      },
      event: ev
    });
    return await popover.present();
  }

  trackByFn(index:number, item:IMessage){
    return item.id;
  }

  scrollEvent(e:any){
    if(e.target.scrollHeight-e.target.offsetHeight-e.target.scrollTop>300){
      if(this.showScrollButton!==true) this.showScrollButton=true;
    }else{
      if(this.showScrollButton===true) this.showScrollButton=false;
    }
  }

  openModal(){
    this.modal.create({
      component:PerfilModalComponent,
      componentProps:{
        user:this.user,
        chat:this.chat,
      }
    }).then(modal=>modal.present());
  }

  scrollToBottom(){
    this.content.scrollToBottom();
  }

  openGroupInfo(){
    this.modal.create({
      component:GroupInfoModalComponent,
      componentProps:{
        idChat:this.idChat
      }
    }).then(modal=>modal.present());
  }
}
