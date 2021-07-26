import { DbService } from './../../../services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import * as firebase from 'firebase';

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
    private router:Router,
    private auth:AngularFireAuth,
    private db:DbService,

  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then((resp:IUserData)=>{
      this.user={
        data:{...resp},
        id:firebase.default.auth().currentUser.uid
      }
      if(resp.imageUrlLoc){
        this.imgPath=Capacitor.convertFileSrc(resp.imageUrlLoc);
      }
    }).catch(err=>console.log(err));
  }

  logout(){
    this.auth.signOut()
      .then(resp=>{
        this.router.navigate(['auth/login']);
      }).catch(error=>{
        console.log(error);
      });
  }
}
