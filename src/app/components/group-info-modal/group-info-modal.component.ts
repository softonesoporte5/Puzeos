import { ActionsUserService } from './../../services/actions-user.service';
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { StoreNames } from 'src/app/enums/store-names.enum';
import { IGroup, IUserDataGroup } from 'src/app/interfaces/group.interface';
import { ILocalForage } from 'src/app/interfaces/localForage.interface';
import { DbService } from 'src/app/services/db.service';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { PerfilGroupModalComponent } from '../perfil-group-modal/perfil-group-modal.component';

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
    public  alertController: AlertController,
    private db:DbService,
    private navParams:NavParams,
    private modal:ModalController,
    private modal2:ModalController,
    private translate: TranslateService,
    private actionsUserService: ActionsUserService
  ) { }

  ngOnInit() {
    this.idChat=this.navParams.get("idChat");
    this.dbChats=this.db.loadStore(StoreNames.Chats);

    this.dbChats.getItem(this.idChat)
    .then((resp:IGroup)=>{
      this.group=resp;
      this.imgPath=`../../../../assets/tags-img/${this.group.title.replace(/ /g,'-').replace(':','')}.jpg`;
    }).catch(err=>console.log(err));
  }

  openModal(){
    this.modal2.create({
      component:ImageModalComponent,
      componentProps:{
        path:this.imgPath,
        type:'image'
      }
    }).then(modal2=>modal2.present());
  }

  close(){
    this.modal.dismiss();
  }

  memberImgRef(member: IUserDataGroup){
    if(member.avatarId !== undefined){
      if(member.avatarId===0){
        return member.compressImage;
      }else{
        return '../../../assets/avatar/avatar_'+member.avatarId+'.jpg';
      }
    }else{
      if(member.compressImage !== undefined){
        return member.compressImage;
      }else{
        return '../../../assets/person.jpg';
      }
    }
  }

  viewProfile(id:string){
    this.actionsUserService.viewProfile(id, {parentModal: this.modal});
  }

}
