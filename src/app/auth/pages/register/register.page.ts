import { FileSystemService } from './../../../services/file-system.service';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { AuthService } from './../../auth.service';
import { NotificationServiceService } from './../../../services/notification-service.service';
import { ILocalForage } from './../../../chat/interfaces/localForage.interface';
import { DbService } from './../../../services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { CameraSource } from '@capacitor/core';
import { IUser } from 'src/app/chat/interfaces/user.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../../auth.scss'],
})
export class RegisterPage implements OnInit {

  dbUsers:ILocalForage;
  imgPath='../../../../assets/person.jpg';
  activeSlide=0;
  languageSelect:string;

  miFormulario:FormGroup=this.fb.group({
    name:['',[Validators.required,Validators.minLength(8)]],
    descripcion:['',[Validators.maxLength(80)]],
    language:[localStorage.getItem("language")?localStorage.getItem("language"):'es'],
  });

  get name(){ return this.miFormulario.get('name'); }
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

  async enviar(){
    if(this.miFormulario.invalid){
      let mensaje:string='';
      //Alertar sobre errores
      if(this.name?.errors?.minlength){
        this.translate.get("Error.MinUserName").subscribe(resp=>mensaje=resp);
      }
      if(this.name?.errors?.required){
        this.translate.get("Error.UserNameRequired").subscribe(resp=>mensaje=resp);
      }

      this.presentToastWithOptions(mensaje);
      return ;
    }

    //Mostrar sniper de carga
    this.loadingService.present();

    //Crear usuario en Firebase
    this.dbUsers=this.db.loadStore("users");

    //Agregar a firebaseStorage
    if(this.imgPath!=='../../../../assets/person.jpg'){
      const user={
        id:firebase.default.auth().currentUser.uid,
        data:{
          userName:this.name.value,
        }
      };

      const fileName = new Date().getTime() + '.jpeg';
      const localImg=await this.fileSystemService.writeFile(this.imgPath,fileName,"Puzeos Profile/");

      if(localImg){
        this.firebaseStorage.uploadPhoto(this.imgPath, user as IUser,localImg,true)
        .then(urlImage=>{
          console.log(urlImage)
          // Guardamos la imagen de manera local
          this.fireStore.collection("users").doc(firebase.default.auth().currentUser.uid).set({//Agregamos el usuario a FireStorage
            userName:this.name.value,
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
            imageUrlLoc:localImg
          }).then(resp=>{
            this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
              userName:this.name.value,
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
              imageUrlLoc:localImg
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
            this.presentToastWithOptions("No se pudo registrar al usuario");
          })
        }).catch(err=>{
          this.loadingService.dismiss();
          this.presentToastWithOptions("Ha ocurrido un error al tratar de guarda la imágen");
          console.log(err);
        })
      }
    }else{
      this.fireStore.collection("users").doc(firebase.default.auth().currentUser.uid).set({//Agregamos el usuario a FireStorage
        userName:this.name.value,
        chats:[],
        token:this.notificationService.token,
        createDate:firebase.default.firestore.FieldValue.serverTimestamp(),
        buscando:{
          state:false,
          tagId:''
        },
        descripcion:this.descripcion.value,
        blockedUsers:{},
        notAddUsers:{}
      }).then(resp=>{
        this.dbUsers.setItem(firebase.default.auth().currentUser.uid,{
          userName:this.name.value,
          chats:[],
          token:this.notificationService.token,
          descripcion:this.descripcion.value,
          buscando:{
            state:false,
            tagId:''
          },
          blockedUsers:{},
          notAddUsers:{}
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
        this.presentToastWithOptions("No se pudo registrar al usuario");
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
            .then(resp=>this.imgPath=resp);
          }
        },
        {
          text: galeryTxt,
          icon: 'image-sharp',
          handler: () => {
            this.authService.selectImage(CameraSource.Photos)
            .then(resp=>this.imgPath=resp);
          }
        },
        {
          text: removeTxt,
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.imgPath='../../../../assets/person.jpg';
          }
        }
      ]
    });
    await actionSheet.present();
  }

  setLanguage(){
    if(this.miFormulario.get('language').value){
      this.translate.use(this.miFormulario.get('language').value);
      localStorage.setItem("language",this.miFormulario.get('language').value);
    }
  }
}
