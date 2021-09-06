import { TranslateService } from '@ngx-translate/core';
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
import { StoreNames } from 'src/app/enums/store-names.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user:IUser;
  imgPath:string='../../../../assets/person.jpg';
  dbUsers:ILocalForage;
  numBlockedUsers=0;

  constructor(
    private firestore:AngularFirestore,
    private db:DbService,
    public alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private camara:CameraService,
    private modal:ModalController,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.dbUsers=this.db.loadStore(StoreNames.Users);

    this.dbUsers.getItem(firebase.default.auth().currentUser.uid)
    .then((resp:IUserData)=>{
      const date=new Date();
      this.user={
        data:{...resp,createDate:date.valueOf()},
        id:firebase.default.auth().currentUser.uid
      }

      this.numBlockedUsers=Object.keys(resp.blockedUsers).length;
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
    let titleTxt='';
    this.translate.get("ProfilePage.ChangeDescription").subscribe(resp=>titleTxt=resp);
    let cancelTxt='';
    this.translate.get("Global.Cancel").subscribe(resp=>cancelTxt=resp);
    let saveTxt='';
    this.translate.get("Global.Save").subscribe(resp=>saveTxt=resp);
    let descriptionTxt='';
    this.translate.get("ProfilePage.ShortDescription").subscribe(resp=>descriptionTxt=resp);

    const alert = await this.alertController.create({
      cssClass: 'alertDescription',
      message: titleTxt,
      buttons: [
        {
          text: cancelTxt,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: saveTxt,
          handler: () => {
            const newDescription=document.querySelector("#descriptionTxt") as HTMLInputElement;
            if(this.user.data.descripcion!==newDescription.value){
              this.user.data.descripcion=newDescription.value;
              this.firestore.collection("users").doc(this.user.id).update({
                descripcion:newDescription.value
              }).then(()=>{
                this.dbUsers.getItem(this.user.id)
                .then((userData:IUserData)=>{
                  this.dbUsers.setItem(this.user.id,{
                    ...userData,
                    descripcion:newDescription.value
                  });
                })
              },()=>{window.alert("Ocurrió un error al tratar de actualizar la descripción")});
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
          placeholder: descriptionTxt,
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
      if(resp){
        this.dbUsers.setItem(this.user.id,{
          ...this.user.data,
          imageUrl:resp.firebasePath,
          imageUrlLoc:resp.filepath
        }).catch(err=>console.log(err));
        this.imgPath=resp.base64Data;
      }
    })
  }

  async changePhoto() {
    let cameraTxt='';
    this.translate.get("Global.Camera").subscribe(resp=>cameraTxt=resp);
    let galeryTxt='';
    this.translate.get("Global.Galery").subscribe(resp=>galeryTxt=resp);
    let removeTxt='';
    this.translate.get("Global.RemovePicture").subscribe(resp=>removeTxt=resp);

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: cameraTxt,
          icon: 'camera-sharp',
          handler: () => {
            this.selectImage(CameraSource.Camera)
          }
        },
        {
          text: galeryTxt,
          icon: 'image-sharp',
          handler: () => {
            this.selectImage(CameraSource.Photos)
          }
        },
        {
          text: removeTxt,
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
              }).then(()=>{
                this.imgPath="../../../../assets/person.jpg";
                delete this.user.data.imageUrl;
                delete this.user.data.imageUrlLoc;
                this.dbUsers.setItem(this.user.id,{
                  ...this.user,
                })
              })
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
