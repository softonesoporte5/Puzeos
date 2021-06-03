import { IMessage } from './../../interfaces/message.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { Component, OnInit } from '@angular/core';
import { NavParams, ToastController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover-chat-message',
  templateUrl: './popover-chat-message.component.html',
  styleUrls: ['./popover-chat-message.component.scss'],
})
export class PopoverChatMessageComponent implements OnInit {

  message:IMessage;
  dbSavedMessages:ILocalForage;
  saved:boolean=true;

  constructor(
    private navParams: NavParams,
    public toastController: ToastController,
    private popoverController: PopoverController,
    private db:DbService
  ) { }

  ngOnInit() {
    this.message=this.navParams.data.message;
    this.dbSavedMessages=this.db.loadStore("savedMessages");
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
    this.dbSavedMessages.setItem(this.message.id,this.message);
    this.popoverController.dismiss();
    this.presentToast('Mensaje guardado.');
  }

}
