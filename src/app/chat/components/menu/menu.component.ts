import { DbService } from './../../../services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { CameraService } from './../../../services/camera.service';
import { IUser } from './../../interfaces/user.interface';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import {Plugins, FilesystemDirectory, FilesystemEncoding} from '@capacitor/core';
const {Filesystem} = Plugins;
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
    private actionSheetController: ActionSheetController,
    private camara:CameraService,
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then(resp=>{
      this.user={
        data:{...resp},
        id:firebase.default.auth().currentUser.uid
      }
      // Filesystem.readFile({
      //   path:this.user.data.imageUrlLoc,
      //   directory:FilesystemDirectory.Data
      // }).then(resp=>{
      //   this.imgPath=`data:image/jpeg;base64,${resp.data}`;
      // }).catch(err=>console.log(err));
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


  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Camara',
          icon: 'camera-sharp',
          handler: () => {
            this.camara.takePicture(this.user).then(resp=>{
              /*this.dbUsers.setItem(this.user.id,{
                ...this.user.data,
                imageUrl:resp.firebasePath,
                imageUrlLoc:resp.filepath
              }).catch(err=>console.log(err));
              this.imgPath=resp.base64Data;*/
            })
          }
        },
        {
          text: 'Galería',
          icon: 'image-sharp',
          handler: () => {
            //this.camara.takePicture();
          }
        },
        {
          text: 'Quitar foto de perfil',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            console.log('Delete clicked');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  opcImg(){
    this.presentActionSheet();
  }

}
