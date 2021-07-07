import { IUserData } from './../../interfaces/user.interface';
import { ModalController, NavParams } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-perfil-modal',
  templateUrl: './perfil-modal.component.html',
  styleUrls: ['./perfil-modal.component.scss'],
})
export class PerfilModalComponent implements OnInit {

  user:IUserData;
  imgPath:string;

  constructor(
    private navParams:NavParams,
    private modalController:ModalController
  ) { }

  ngOnInit() {
    this.user=this.navParams.get("user");
    if(this.user.imageUrlLoc){
      this.imgPath=Capacitor.convertFileSrc(this.user.imageUrlLoc);
    }else{
      this.imgPath="assets/person.jpg";
    }
  }

  close(){
    this.modalController.dismiss();
  }

}
