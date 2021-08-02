import { ImageModalComponent } from './../../components/image-modal/image-modal.component';
import { ImageCropperModalComponent } from './../../components/image-cropper-modal/image-cropper.component';
import { CameraService } from './../../../services/camera.service';
import { AlertController, ActionSheetController, ModalController } from '@ionic/angular';
import { Capacitor, CameraSource } from '@capacitor/core';
import { IUserData } from './../../interfaces/user.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { DbService } from './../../../services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { IUser } from '../../interfaces/user.interface';
import * as firebase from 'firebase';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user:IUser;
  imgPath:string='../../../../assets/person.jpg';
  dbUsers:ILocalForage;

  constructor(
    private firestore:AngularFirestore,
    private db:DbService,
    public alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private camara:CameraService,
    private modal:ModalController
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore("users");

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then((resp:IUserData)=>{
      //const date=new Date(resp.createDate.toDate());
      const date=new Date();
      this.user={
        data:{...resp,createDate:date.valueOf()},
        id:firebase.default.auth().currentUser.uid
      }
      if(resp.imageUrlLoc){
        this.imgPath=Capacitor.convertFileSrc(resp.imageUrlLoc);
      }
    }).catch(err=>console.log(err));

    //Disparar el recortador
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

  async changeDescription() {
    const alert = await this.alertController.create({
      cssClass: 'alertDescription',
      message: 'Cambiar descripción',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {

          }
        }, {
          text: 'Guardar',
          handler: () => {
            const newDescription=document.querySelector("#descriptionTxt") as HTMLInputElement;
            if(this.user.data.descripcion!==newDescription.value){
              this.user.data.descripcion=newDescription.value;
              this.firestore.collection("users").doc(this.user.id).update({
                descripcion:newDescription.value
              }).catch(error=>{
                console.log("Hubo un error",error);
              });
            }
          }
        }
      ],
      inputs: [
        {
          name: 'description',
          id:'descriptionTxt',
          type: 'text',
          max:80,
          placeholder: 'Descripción corta',
          value:this.user.data.descripcion,
          handler:()=>{

          }
        }
      ]
    });

    await alert.present();
  }

  private selectImage(source:CameraSource){
    this.camara.takePicture(this.user,source).then(resp=>{

      this.dbUsers.setItem(this.user.id,{
        ...this.user.data,
        imageUrl:resp.firebasePath,
        imageUrlLoc:resp.filepath
      }).catch(err=>console.log(err));
      this.imgPath=resp.base64Data;
    })
  }

  async changePhoto() {
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
