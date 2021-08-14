import { Subscription } from 'rxjs';
import { ChatService } from './../../pages/chat/chat.service';
import { TranslateService } from '@ngx-translate/core';
import { IUser } from './../../interfaces/user.interface';
import { IonItemSliding, AlertController, IonTextarea } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { IMessage } from './../../interfaces/message.interface';
import { MediaRecorderService } from './../../../services/media-recorder.service';
import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Keyboard } = Plugins;

@Component({
  selector: 'app-footer-chat',
  templateUrl: './footer-chat.component.html',
  styleUrls: ['./footer-chat.component.scss'],
})
export class FooterChatComponent implements OnInit, OnDestroy {

  replyMessage:IMessage;
  tooglePress:boolean=false;
  blockChat:boolean=false;
  showEmojiPickerCont:number=0;
  showEmojiPicker:boolean=false;
  tiempoGrabacion:string='00:00';
  resetPosEmoji:boolean=true;
  posEmoji:number=0;
  cancelar:boolean=false;
  bucleTime:NodeJS.Timeout;
  replySubscribe:Subscription;
  @ViewChild('sliding', { static: false }) sliding: IonItemSliding;
  @ViewChild('textarea') textarea: IonTextarea;
  @Input("user") user: IUser;
  @Input("username") username:string;
  @Input("idChat") idChat:string;

  miFormulario:FormGroup=this.fb.group({
    mensaje:['',[Validators.required,Validators.minLength(1)]]
  });

  mensaje:AbstractControl=this.miFormulario.get("mensaje");

  constructor(
    private mediaRecorderService:MediaRecorderService,
    private fb:FormBuilder,
    private translate:TranslateService,
    private alertController: AlertController,
    private chatService:ChatService
  ) { }

  ngOnInit() {
    this.replySubscribe=this.chatService.replyMessage$.subscribe(resp=>{
      this.replyMessage=resp;
    });

    Keyboard.addListener("keyboardDidShow",()=>{
      if(this.showEmojiPicker){
          Keyboard.hide();
      }
    });
  }

  ngOnDestroy(){
    if(this.replySubscribe){
      this.replySubscribe.unsubscribe();
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
    this.showEmojiPickerCont++;
  }

  recorder(){
    if(this.mediaRecorderService.permiso){
      this.tooglePress=true;
      this.cancelar=false;
      this.mediaRecorderService.recorder();
      let seconds=0;

      this.bucleTime=setInterval(()=>{
        seconds++;
        let minute:string | number = Math.floor((seconds / 60) % 60);
        minute = (minute < 10)? '0' + minute : minute;
        let second:string | number = seconds % 60;
        second = (second < 10)? '0' + second : second;
        this.tiempoGrabacion=minute + ':' + second;
      }
      ,1000);
    }else{
      let txt='';
      this.translate.get("ChatPage.AlertMessage").subscribe(resp=>{txt=resp});
      this.presentAlert(txt);
    }
  }

  stop(){
    this.tooglePress=false;
    this.sliding.close();
    this.mediaRecorderService.stop(this.tiempoGrabacion,this.username,this.idChat,this.cancelar);
    this.tiempoGrabacion='00:00';
    clearInterval(this.bucleTime);
  }

  agregarMensaje(){
    const message=this.mensaje.value;
    if(this.replyMessage){
      this.chatService.addMessageInFirebase(message,this.idChat,this.username,this.user,this.replyMessage);
      this.mensaje.setValue('');
      this.replyMessage=null;
    }else{
      this.chatService.addMessageInFirebase(message,this.idChat,this.username,this.user);
      this.mensaje.setValue('');
    }
  }

  deleteReply(){
    this.replyMessage=null;
  }

  public handleSlide(event: any): void {
    if(event.detail.ratio>=1 && this.tooglePress || event.detail.ratio==1){
      this.cancelar=true;
      this.stop();
    }
  }

  async presentAlert(message:string) {
    let txt='';
    this.translate.get("Global.ToAccept").subscribe(resp=>{txt=resp});
    const alert = await this.alertController.create({
      message: message,
      buttons: [
        {
          text: txt,
        }
      ]
    });
    await alert.present();
  }
}
