import { ToastService } from './../../services/toast.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { PerfilGroupModalComponent } from './../perfil-group-modal/perfil-group-modal.component';
import { ChatService } from '../../services/chat.service';
import { IMessage } from './../../interfaces/message.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { Component, OnInit } from '@angular/core';
import { NavParams, ToastController, PopoverController, ModalController } from '@ionic/angular';
import { StoreNames } from 'src/app/enums/store-names.enum';

@Component({
  selector: 'app-popover-chat-message',
  templateUrl: './popover-chat-message.component.html',
  styleUrls: ['./popover-chat-message.component.scss'],
})
export class PopoverChatMessageComponent implements OnInit {

  message:IMessage;
  dbSavedMessages:ILocalForage;
  saved:boolean=true;
  idChat:string;
  group:boolean;

  constructor(
    private navParams: NavParams,
    private toastController: ToastController,
    private popoverController: PopoverController,
    private db:DbService,
    private chatService:ChatService,
    private modal:ModalController,
    private firestore: AngularFirestore,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.message=this.navParams.data.message;
    this.idChat=this.navParams.data.idChat;
    this.group=this.navParams.data.group;

    this.dbSavedMessages=this.db.loadStore(StoreNames.SavedMessages);
    this.dbSavedMessages.getItem(this.message.id)
    .then(resp=>{
      if(resp) this.saved=false;
      else this.saved=true;
    }).catch(err=>console.log(err));
  }

  async presentToast(text:string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 1500
    });
    toast.present();
  }

  copy(){
    let aux=document.createElement("input");
    aux.setAttribute("value",this.message.message);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.popoverController.dismiss();
    this.presentToast('Mensaje copiado.');
  }

  save(){
    this.dbSavedMessages.setItem(this.message.id,{...this.message,idChat:this.idChat});
    this.popoverController.dismiss();
    this.presentToast('Mensaje guardado.');
  }

  reply(){
    this.chatService.replyMessage$.next(this.message);
    this.popoverController.dismiss();
  }

  viewProfile(){
    this.modal.create({
      component:PerfilGroupModalComponent,
      componentProps:{
        userId:this.message.toUserId
      }
    }).then(modal=>modal.present());
  }

  report(){
    this.firestore.collection("reportAccount").add({
      id: this.message.toUserId,
      message : this.message.message
    }).then(()=>{
      alert("Se ha reportado el mensaje");
    },()=>{
      this.toast.presentToast("Ha ocurrido un error");
    });
    this.popoverController.dismiss();
  }
}
