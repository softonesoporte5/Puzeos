import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { AuthService } from './../../auth.service';
import { NotificationServiceService } from './../../../services/notification-service.service';
import { ILocalForage } from './../../../chat/interfaces/localForage.interface';
import { DbService } from './../../../services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Plugins, FilesystemDirectory, CameraSource } from '@capacitor/core';
import { IUser } from 'src/app/chat/interfaces/user.interface';

const { Camera, Filesystem } = Plugins;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../../auth.scss'],
})
export class RegisterPage implements OnInit {

  private _emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  dbUsers:ILocalForage;

  miFormulario:FormGroup=this.fb.group({
    name:['',[Validators.required,Validators.minLength(8)]],
    email:['',[Validators.pattern(this._emailPattern),Validators.required,Validators.minLength(6)]],
    descripcion:['',[Validators.maxLength(80)]],
    passwords:this.fb.group({
      password:['', [Validators.required,Validators.minLength(9)]],
      password2:['',[Validators.required]],
    },{validators:this.passwordMatchValidator})
  });

  get name(){ return this.miFormulario.get('name'); }
  get email(){ return this.miFormulario.get('email'); }
  get descripcion(){ return this.miFormulario.get('descripcion'); }
  get password(){ return this.miFormulario.get('passwords.password'); }
  get password2(){ return this.miFormulario.get('passwords.password2'); }

  imgPath='../../../../assets/person.jpg';

  passwordMatchValidator(control: AbstractControl) {
    return control.get('password')?.value === control.get('password2')?.value
       ? null : {'mismatch': true};
  }

  constructor(
    private fb:FormBuilder,
    private toastController: ToastController,
    private auth:AngularFireAuth,
    private router:Router,
    private loadingService:LoadingService,
    private fireStore:AngularFirestore,
    private db:DbService,
    private notificationService:NotificationServiceService,
    private actionSheetController: ActionSheetController,
    private authService:AuthService,
    private firebaseStorage:FirebaseStorageService
  ) { }

  ngOnInit() {}

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

  enviar(){

    if(this.miFormulario.invalid){
      let mensaje:string='';
      //Alertar sobre errores
      if(this.miFormulario.get('passwords')?.errors?.mismatch){mensaje='Las constraseñas no coinciden';}
      if(this.password2?.errors?.required){mensaje='El campo "Confirmar contraseña" es requerido';}
      if(this.password?.errors?.minlength){mensaje='La contraseña debe tener al menos 9 caracteres';}
      if(this.email?.errors?.minlength){mensaje='El correo debe tener al menos 6 caracteres';}
      if(this.email?.errors?.pattern){mensaje='Introduzca una dirección de correo válida';}
      if(this.name?.errors?.minlength){mensaje='El nombre de usuario debe tener al menos 8 caracteres';}
      if(this.email?.errors?.required){mensaje='El correo es requerido';}
      if(this.password?.errors?.required){mensaje='La contraseña es requerida';}
      if(this.name?.errors?.required){mensaje='El campo "Nombre de usuario" es requerido';}

      this.presentToastWithOptions(mensaje);

      return ;
    }

    //Mostrar sniper de carga
    this.loadingService.present();

    //Crear usuario en Firebase
     this.auth.createUserWithEmailAndPassword(this.email.value,this.password.value)
       .then(userInfo=>{
         userInfo.user.sendEmailVerification()//Enviamos email de verificación
          .then(()=>{
            this.dbUsers=this.db.loadStore("users");

            //Agregar a firebaseStorage
            if(this.imgPath!=='../../../../assets/person.jpg'){
              const user={
                id:userInfo.user.uid,
                data:{
                  userName:this.name.value,
                }
              };
              this.firebaseStorage.uploadPhoto(this.imgPath, user as IUser,true)
              .then(urlImage=>{
                // Guardamos la imagen de manera local
                const fileName = new Date().getTime() + '.jpeg';

                Filesystem.writeFile({
                  path:fileName,
                  data:this.imgPath,
                  directory:FilesystemDirectory.Data
                }).then(respUser=>{
                  this.fireStore.collection("users").doc(userInfo.user.uid).set({//Agregamos el usuario a FireStorage
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
                    imageUrlLoc:respUser.uri
                  }).then(resp=>{
                    this.dbUsers.setItem(userInfo.user.uid,{
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
                      imageUrlLoc:respUser.uri
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

                },err=>{
                  this.loadingService.dismiss();
                  console.log(err)
                });
              }).catch(err=>{
                this.loadingService.dismiss();
                this.presentToastWithOptions("Ha ocurrido un error al tratar de guarda la imágen");
                console.log(err);
              })
            }else{
              this.fireStore.collection("users").doc(userInfo.user.uid).set({//Agregamos el usuario a FireStorage
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
                this.dbUsers.setItem(userInfo.user.uid,{
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
          })
          .catch(error=>{
            console.log(error);
          });

       }).catch(error=>{
        this.loadingService.dismiss();

         if(error.code==="auth/email-already-in-use"){
          this.presentToastWithOptions("El correo electrónico ya está en uso");
        }
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
            this.authService.selectImage(CameraSource.Camera)
            .then(resp=>this.imgPath=resp);
          }
        },
        {
          text: 'Galería',
          icon: 'image-sharp',
          handler: () => {
            this.authService.selectImage(CameraSource.Photos)
          }
        },
        {
          text: 'Quitar foto de perfil',
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

}
