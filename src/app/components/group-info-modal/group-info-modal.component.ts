import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { StoreNames } from 'src/app/enums/store-names.enum';
import { IGroup } from 'src/app/interfaces/group.interface';
import { ILocalForage } from 'src/app/interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-group-info-modal',
  templateUrl: './group-info-modal.component.html',
  styleUrls: ['./group-info-modal.component.scss'],
})
export class GroupInfoModalComponent implements OnInit {

  imgPath:string='../../../../assets/person.jpg';
  dbChats:ILocalForage;
  group:IGroup;
  idChat:string;
  constructor(
    //private firestore:AngularFirestore,
    public alertController: AlertController,
    private db:DbService,
    private navParams:NavParams,
    //private actionSheetController: ActionSheetController,
    //private camara:CameraService,
    private modal:ModalController,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.idChat=this.navParams.get("idChat");
    this.dbChats=this.db.loadStore(StoreNames.Chats);

    this.dbChats.getItem(this.idChat)
    .then((resp:IGroup)=>{
      this.group=resp;
      console.log(this.idChat)
      this.imgPath=`../../../../assets/tags-img/${this.group.title.replace(/ /g,'-').replace(':','')}.jpg`;
    }).catch(err=>console.log(err));
  }

  openModal(){
    this.modal.create({
      component:ImageModalComponent,
      componentProps:{
        path:this.imgPath,
        type:'image'
      }
    }).then(modal=>modal.present());
  }
}
