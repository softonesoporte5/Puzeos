import { TopicsModalComponent } from './../../../components/topics-modal/topics-modal.component';
import { ImageModalComponent } from './../../../components/image-modal/image-modal.component';
import { ImageCropperModalComponent } from './../../../components/image-cropper-modal/image-cropper.component';
import { ILocalForage } from './../../../interfaces/localForage.interface';
import { IUser, IUserData } from './../../../interfaces/user.interface';
import { TranslateService } from '@ngx-translate/core';
import { CameraService } from './../../../services/camera.service';
import { AlertController, ActionSheetController, ModalController } from '@ionic/angular';
import { Capacitor, CameraSource } from '@capacitor/core';
import { DbService } from './../../../services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
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
  pais:string;
  gender : {
    genderID:string;
    genderLabel:string;
    genderIcon: string;
  }

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
      if(!resp.favoriteTopics) {
        resp.favoriteTopics=[null, null, null];
        console.log(resp.favoriteTopics)
      };
      this.user={
        data:resp,
        id:firebase.default.auth().currentUser.uid
      }

      this.numBlockedUsers=Object.keys(resp.blockedUsers).length;
      if(resp.imageUrlLoc){
        this.imgPath=Capacitor.convertFileSrc(resp.imageUrlLoc);
      }else{
        this.imgPath='../../../../assets/avatar/avatar_'+resp.avatarId+'.jpg'
      }

      for(let i=0; i<3; i++){
        if(!this.user.data.favoriteTopics[i]){
          this.user.data.favoriteTopics[i]=null;
        }
      }

      if(this.user.data.gender){
        this.gender = {
          genderID: this.user.data.gender == 1? "male": "female",
          genderLabel: this.user.data.gender == 1? "Hombre": "Mujer",
          genderIcon : this.user.data.gender == 1? "male-sharp": "female-sharp"
        }
      }else{
        this.gender = {
          genderID: "oculto",
          genderLabel: "Oculto",
          genderIcon : "male-female-sharp"
        }
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
              },()=>{
                this.translate.get("Error.UpdateDescription").subscribe(resp=>{
                  window.alert(resp)});
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
          placeholder: descriptionTxt,
          value:this.user.data.descripcion,
          handler:()=>{

          }
        }
      ]
    });

    await alert.present();
  }

  async changeApodo() {
    let titleTxt='';
    this.translate.get("ProfilePage.ChangeNickname").subscribe(resp=>titleTxt=resp);
    let cancelTxt='';
    this.translate.get("Global.Cancel").subscribe(resp=>cancelTxt=resp);
    let saveTxt='';
    this.translate.get("Global.Save").subscribe(resp=>saveTxt=resp);
    let inputTxt='';
    this.translate.get("ProfilePage.NewNickname").subscribe(resp=>inputTxt=resp);

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
            const newApodo=document.querySelector("#apodoTxt") as HTMLInputElement;
            if(this.user.data.descripcion!==newApodo.value && newApodo.value.trim()!==""){
              this.user.data.userName=newApodo.value;
              this.firestore.collection("users").doc(this.user.id).update({
                userName: newApodo.value
              }).then(()=>{
                this.dbUsers.getItem(this.user.id)
                .then((userData:IUserData)=>{
                  this.dbUsers.setItem(this.user.id,{
                    ...userData,
                    userName: newApodo.value
                  });
                  this.user.data.userName=newApodo.value
                })
              },()=>{
                this.translate.get("Error.UpdateNickname").subscribe(resp=>{
                  window.alert(resp)
                });
              });
            }
          }
        }
      ],
      inputs: [
        {
          name: 'apodoTxt',
          id:'apodoTxt',
          type: 'text',
          max:80,
          placeholder: inputTxt,
          value:this.user.data.userName,
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
    let confirmTxt='';
    this.translate.get("Global.Camera").subscribe(resp=>confirmTxt=resp);

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: confirmTxt,
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
                  ...this.user.data,
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

  openTopicModal(pos:number){
    this.modal.create({
      component: TopicsModalComponent,
      componentProps:{
        user: this.user,
        pos: pos
      }
    }).then(modal=>modal.present());
  }

  async openActionSheetGender(){
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: "Hombre",
          icon: 'male-sharp',
          handler: () => {
            this.gender = {
              genderID: "male",
              genderLabel: "Hombre",
              genderIcon : "male-sharp"
            }
            this.changeGender(1);
          }
        },
        {
          text: "Mujer",
          icon: 'female-sharp',
          handler: () => {
            this.gender = {
              genderID: "female",
              genderLabel: "Mujer",
              genderIcon : "female-sharp"
            }
            this.changeGender(2);
          }
        },
        {
          text: "Oculto",
          icon: 'male-female-sharp',
          handler: () => {
            this.gender = {
              genderID: "",
              genderLabel: "Oculto",
              genderIcon : "male-female-sharp"
            }
            this.changeGender(0);
          }
        }
      ]
    });
    await actionSheet.present();
  }

  changeGender(id: number){
    if(this.user.data?.gender!==id){
      this.user.data.gender=id;
      this.firestore.collection("users").doc(this.user.id).update({
        gender:id
      }).then(()=>{
        this.dbUsers.getItem(this.user.id)
        .then((userData:IUserData)=>{
          this.dbUsers.setItem(this.user.id,{
            ...userData,
            gender:id
          });
        })
      },()=>{
        window.alert("Ha ocurrido un error al cambiar el género")});
    }
  }
}
