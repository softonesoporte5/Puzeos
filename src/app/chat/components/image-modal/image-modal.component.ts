import { NavParams, ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss'],
})
export class ImageModalComponent implements OnInit {

  path:string;
  type:string;

  sliderOpts={
    zoom:{
      maxRatio:5
    }
  }

  constructor(
    private navParams:NavParams,
    private modalController:ModalController
  ) { }

  ngOnInit() {
    this.path=this.navParams.get("path");
    this.type=this.navParams.get("type");
  }

  close(){
    this.modalController.dismiss();
  }
}
