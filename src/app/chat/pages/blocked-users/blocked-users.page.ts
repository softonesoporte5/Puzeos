import { LoadingService } from './../../../services/loading.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { DbService } from './../../../services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { IUserData } from '../../interfaces/user.interface';

@Component({
  selector: 'app-blocked-users',
  templateUrl: './blocked-users.page.html',
  styleUrls: ['./blocked-users.page.scss'],
})
export class BlockedUsersPage implements OnInit {

  dbUsers:ILocalForage;
  blockedUsers:string[]=[];
  user:IUserData;

  constructor(
    private db:DbService,
    private firestore:AngularFirestore,
    private loadingService:LoadingService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(resp=>{
      this.user=resp;
      this.blockedUsers=resp.blockedUsers;
    }).catch(err=>console.log(err));
  }

  unlockUser(userName:string){
    this.loadingService.present();

    this.blockedUsers=this.blockedUsers.filter(user=>user!==userName);

    this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid)
    .update({
      blockedUsers:this.blockedUsers
    }).then(()=>{
      this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
        ...this.user,
        blockedUsers:this.blockedUsers
      }).then(()=>{
        this.loadingService.dismiss()
      }).catch(err=>console.log(err));
    }).catch(err=>console.log(err));
  }

}
