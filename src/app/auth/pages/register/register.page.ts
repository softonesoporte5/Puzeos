import { IUser } from './../../../interfaces/user.interface';
import { ILocalForage } from './../../../interfaces/localForage.interface';
import { FileSystemService } from './../../../services/file-system.service';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { AuthService } from './../../auth.service';
import { NotificationServiceService } from './../../../services/notification-service.service';
import { DbService } from './../../../services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { CameraSource } from '@capacitor/core';
import { TranslateService } from '@ngx-translate/core';
import {compressUriImage} from '../../../utils/utils';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../../auth.scss'],
})
export class RegisterPage implements OnInit {

  dbUsers:ILocalForage;
  imgPath='../../../../assets/person.jpg';
  compressImg:string;
  activeSlide=0;
  languageSelect:string;
  continue=false;
  ageArr=[]
  age="";
  miFormulario:FormGroup=this.fb.group({
    apodo:['', [Validators.required, Validators.minLength(3)]],
    avatar:[null, [Validators.required]],
    descripcion:['',[Validators.maxLength(80)]],
  });

  get apodo(){ return this.miFormulario.get('apodo'); }
  get avatar(){ return this.miFormulario.get('avatar'); }
  get descripcion(){ return this.miFormulario.get('descripcion'); }

  constructor(
    private fb:FormBuilder,
    private toastController: ToastController,
    private router:Router,
    private loadingService:LoadingService,
    private fireStore:AngularFirestore,
    private db:DbService,
    private notificationService:NotificationServiceService,
    private actionSheetController: ActionSheetController,
    private authService:AuthService,
    private firebaseStorage:FirebaseStorageService,
    private translate: TranslateService,
    private fileSystemService:FileSystemService,
  ) { }

  ngOnInit() {
    let arr=[];
    for(let i=13; i<99; i++){
      arr.push(i);
    }
    this.ageArr=arr;
  }

  async presentToastWithOptions(mensaje:string){
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 7000,
      color:"danger",
      buttons: [
        {
          text: 'x',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  selectAvatar(ele:HTMLDivElement, id:number){
    if(id===0){
      if(this.imgPath!=='../../../../assets/person.jpg'){
        this.avatar.setValue(id);
        document.querySelectorAll(".loc__grid>div")
        .forEach(ele=>ele.classList.remove("loc__avatar-selected"));

        ele.classList.add("loc__avatar-selected");
      }
    }else{
      this.avatar.setValue(id);
      document.querySelectorAll(".loc__grid>div")
      .forEach(ele=>ele.classList.remove("loc__avatar-selected"));

      ele.classList.add("loc__avatar-selected");
    }
  }

  continueRegister(){
    if(this.miFormulario.invalid){
      let mensaje:string='';
      //Alertar sobre errores
      this.continue=false;
      if(this.apodo?.errors?.minlength){
        this.translate.get("Error.MinNickname").subscribe(resp=>mensaje=resp);
      }
      if(this.apodo?.errors?.required){
        this.translate.get("Error.NicknameRequired").subscribe(resp=>mensaje=resp);
      }
      if(this.avatar?.errors?.required){
        this.translate.get("Error.AvatarRequired").subscribe(resp=>mensaje=resp);
      }
      this.presentToastWithOptions(mensaje);
      return ;
    }else{
      if(this.apodo.value.trim().length<=2){
        this.translate.get("Error.MinNickname").subscribe(resp=>{
          this.presentToastWithOptions(resp);
        });
        return;
      }

      this.apodo.setValue(this.apodo.value.trim());
      this.continue=true;
    }
  }

  async enviar(){
    if(!this.age){
      this.translate.get("Error.AgeRequired").subscribe(resp=>{
        this.presentToastWithOptions(resp);
        return;
      });
      return;
    }

    //Mostrar sniper de carga
    this.loadingService.present();

    const ipApi= await fetch("http://ip-api.com/json/");
    const country=await ipApi.json();
    this.dbUsers=this.db.loadStore("users");

    //Agregar a firebaseStorage
    if(this.avatar.value===0){
      const user={
        id:firebase.default.auth().currentUser.uid,
        data:{
          userName:this.apodo.value,
        }
      };

      const fileName = new Date().getTime() + '.jpeg';
      const localImg=await this.fileSystemService.writeFile(this.imgPath,fileName,"Puzeos Profile/");

      if(localImg){
        this.firebaseStorage.uploadPhoto(this.imgPath, user as IUser,localImg,true)
        .then(urlImage=>{
          // Guardamos la imagen de manera local
          this.fireStore.collection("users").doc(firebase.default.auth().currentUser.uid).set({//Agregamos el usuario a FireStorage
            userName:this.apodo.value,
            chats:[],
            token:this.notificationService.token,
            createDate:firebase.default.firestore.FieldValue.serverTimestamp(),
            buscando:{
              state:false,
              tagId:''
            },
            descripcion:this.descripcion.value,
            blockedUsers:{},
            notAddUsers:{},
            imageUrl:urlImage,
            imageUrlLoc:localImg,
            avatarId: this.avatar.value,
            compressImage: this.compressImg,
            age:this.age,
            location:{
              country: country.country,
              countryCode: country.countryCode
            }
          }).then(resp=>{
            this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
              userName:this.apodo.value,
              chats:[],
              token:this.notificationService.token,
              descripcion:this.descripcion.value,
              buscando:{
                state:false,
                tagId:''
              },
              blockedUsers:{},
              notAddUsers:{},
              imageUrl:urlImage,
              imageUrlLoc:localImg,
              avatarId: this.avatar.value,
              compressImage: this.compressImg,
              age:this.age,
              location:{
                country: country.country,
                countryCode: country.countryCode
              }
            }).then(()=>{
              this.loadingService.dismiss();
              this.router.navigate(['chat'], { queryParams: {welcome:true}})
            }).catch(err=>{
              console.log(err);
              this.loadingService.dismiss();
              this.router.navigate(['chat'], { queryParams: {welcome:true}})
            });
          }).catch(err=>{
            this.loadingService.dismiss();
            if(this.avatar?.errors?.required){
              this.translate.get("Error.NotRegisterUser").subscribe(resp=>{
                this.presentToastWithOptions(resp);
              });
            }
          })
        }).catch(err=>{
          this.loadingService.dismiss();
          this.translate.get("Error.SaveImage").subscribe(resp=>{
            this.presentToastWithOptions(resp);
          });
          console.log(err);
        })
      }
    }else{
      this.fireStore.collection("users").doc(firebase.default.auth().currentUser.uid).set({//Agregamos el usuario a FireStorage
        userName:this.apodo.value,
        chats:[],
        token:this.notificationService.token,
        createDate:firebase.default.firestore.FieldValue.serverTimestamp(),
        buscando:{
          state:false,
          tagId:''
        },
        descripcion:this.descripcion.value,
        blockedUsers:{},
        notAddUsers:{},
        avatarId: this.avatar.value,
        age:this.age,
        location:{
          country: country.country,
          countryCode: country.countryCode
        }
      }).then(resp=>{
        this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
          userName:this.apodo.value,
          chats:[],
          token:this.notificationService.token,
          descripcion:this.descripcion.value,
          buscando:{
            state:false,
            tagId:''
          },
          blockedUsers:{},
          notAddUsers:{},
          avatarId: this.avatar.value,
          age:this.age,
          location:{
            country: country.country,
            countryCode: country.countryCode
          }
        }).then(()=>{
          this.loadingService.dismiss();
          this.router.navigate(['chat'], { queryParams: {welcome:true}})
        }).catch(err=>{
          console.log(err);
          this.loadingService.dismiss();
          this.router.navigate(['chat'], { queryParams: {welcome:true}})
        });
      }).catch(err=>{
        this.loadingService.dismiss();
        this.translate.get("Error.NotRegisterUser").subscribe(resp=>{
          this.presentToastWithOptions(resp);
        });
      })
    }
  }

  async presentActionSheet() {
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
            this.authService.selectImage(CameraSource.Camera)
            .then(async resp=>{
              this.compressImg=await compressUriImage(resp);
              console.log(this.compressImg);
              this.imgPath=resp;
              this.avatar.setValue(0);
              document.querySelectorAll(".loc__grid>div")
              .forEach(ele=>ele.classList.remove("loc__avatar-selected"));

              document.querySelectorAll(".loc__grid>div")[0].classList.add("loc__avatar-selected");
            });
          }
        },
        {
          text: galeryTxt,
          icon: 'image-sharp',
          handler: () => {
            this.authService.selectImage(CameraSource.Photos)
            .then(async resp=>{
              this.compressImg=await compressUriImage(resp);
              console.log(this.compressImg);
              this.imgPath=resp;
              this.avatar.setValue(0);
              document.querySelectorAll(".loc__grid>div")
              .forEach(ele=>ele.classList.remove("loc__avatar-selected"));

              document.querySelectorAll(".loc__grid>div")[0].classList.add("loc__avatar-selected");
            });
          }
        },
        {
          text: removeTxt,
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.imgPath='../../../../assets/person.jpg';
            this.avatar.setValue(null);
            document.querySelectorAll(".loc__grid>div")
              .forEach(ele=>ele.classList.remove("loc__avatar-selected"));
          }
        }
      ]
    });
    await actionSheet.present();
  }
}
