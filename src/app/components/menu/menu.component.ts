import { DbService } from './../../services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import * as firebase from 'firebase';
import { StoreNames } from 'src/app/enums/store-names.enum';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  dbUsers:ILocalForage;
  user:IUser;
  imgPath:string="../../../../assets/person.jpg";

  constructor(
    private db:DbService,
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore(StoreNames.Users);
    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then((resp:IUserData)=>{
      this.user={
        data:{...resp},
        id:firebase.default.auth().currentUser.uid
      }
      if(resp.imageUrlLoc){
        this.imgPath=Capacitor.convertFileSrc(resp.imageUrlLoc);
      }else{
        this.imgPath='../../../../assets/avatar/avatar_'+resp.avatarId+'.jpg'
      }
    }).catch(err=>console.log(err));
  }
}
