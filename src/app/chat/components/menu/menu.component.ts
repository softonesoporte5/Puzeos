import { AngularFirestore } from '@angular/fire/firestore';
import { ImageCropperModalComponent } from './../image-cropper-modal/image-cropper.component';
import { DbService } from './../../../services/db.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { CameraService } from './../../../services/camera.service';
import { IUser, IUserData } from './../../interfaces/user.interface';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, AlertController } from '@ionic/angular';
import { Capacitor, CameraSource } from '@capacitor/core';
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
    private db:DbService,
    private modal:ModalController,
    private alertController: AlertController,
    private firestore:AngularFirestore
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then((resp:IUserData)=>{
      this.user={
        data:{...resp},
        id:firebase.default.auth().currentUser.uid
      }
      console.log(resp)
      if(resp.imageUrlLoc){
        this.imgPath=Capacitor.convertFileSrc(resp.imageUrlLoc);
      }
    }).catch(err=>console.log(err));

    this.camara.getImageData()
    .subscribe(resp=>{
      this.modal.create({
        component:ImageCropperModalComponent,
        componentProps:{
          base64:resp
        }
      }).then(modal=>modal.present());
    })
  }

  logout(){
    this.auth.signOut()
      .then(resp=>{
        this.router.navigate(['auth/login']);
      }).catch(error=>{
        console.log(error);
      });
  }

  private selectImage(source:CameraSource){
    this.camara.takePicture(this.user,source).then(resp=>{

    console.log(resp.filepath)
     this.dbUsers.setItem(this.user.id,{
        ...this.user.data,
        imageUrl:resp.firebasePath,
        imageUrlLoc:resp.filepath
      }).catch(err=>console.log(err));
      this.imgPath=resp.base64Data;
    })
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Camara',
          icon: 'camera-sharp',
          handler: () => {
            this.selectImage(CameraSource.Camera)
          }
        },
        {
          text: 'Galería',
          icon: 'image-sharp',
          handler: () => {
            this.selectImage(CameraSource.Photos)
          }
        },
        {
          text: 'Quitar foto de perfil',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.presentAlertConfirm();
          }
        }
      ]
    });
    await actionSheet.present();
  }

  opcImg(){
    this.presentActionSheet();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: "¿Seguro de que quieres quitar tu foto de perfil?",
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Quitar',
          handler: () => {
            this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
            .then((resp:IUserData)=>{
              this.firestore.collection("users").doc(firebase.default.auth().currentUser.uid)
              .update({
                imageUrl:firebase.default.firestore.FieldValue.delete(),
                imageUrlLoc:firebase.default.firestore.FieldValue.delete()
              }).then(()=>this.imgPath="../../../../assets/person.jpg")
              .catch(err=>console.log(err));
            });
          }
        }
      ]
    });
    await alert.present();
  }

}
