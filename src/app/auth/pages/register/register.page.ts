import { FileSystemService } from './../../../services/file-system.service';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { AuthService } from './../../auth.service';
import { NotificationServiceService } from './../../../services/notification-service.service';
import { ILocalForage } from './../../../chat/interfaces/localForage.interface';
import { DbService } from './../../../services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ActionSheetController, IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Plugins, FilesystemDirectory, CameraSource } from '@capacitor/core';
import { IUser } from 'src/app/chat/interfaces/user.interface';
import { TranslateService } from '@ngx-translate/core';

const { Camera, Filesystem } = Plugins;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../../auth.scss'],
})
export class RegisterPage implements OnInit, AfterViewInit {

  private _emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  dbUsers:ILocalForage;
  imgPath='../../../../assets/person.jpg';
  activeSlide=0;
  languageSelect:string;
  @ViewChild("IonSlides", {static:false}) IonSlides:IonSlides;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  miFormulario:FormGroup=this.fb.group({
    name:['',[Validators.required,Validators.minLength(8)]],
    email:['',[Validators.pattern(this._emailPattern),Validators.required,Validators.minLength(6)]],
    descripcion:['',[Validators.maxLength(80)]],
    language:[localStorage.getItem("language")?localStorage.getItem("language"):'en'],
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
    private firebaseStorage:FirebaseStorageService,
    private translate: TranslateService,
    private fileSystemService:FileSystemService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.IonSlides.ionSlideDidChange
    .subscribe(()=>{
      this.IonSlides.getActiveIndex()
      .then(resp=>this.activeSlide=resp);
    });
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

  enviar(){

    if(this.miFormulario.invalid){
      let mensaje:string='';
      //Alertar sobre errores
      if(this.miFormulario.get('passwords')?.errors?.mismatch){
        this.translate.get("Error.NotMatchPasswords").subscribe(resp=>mensaje=resp);
      }
      if(this.password2?.errors?.required){
        this.translate.get("Error.ConfirmPasswordRequired").subscribe(resp=>mensaje=resp);
      }
      if(this.password?.errors?.minlength){
        this.translate.get("Error.MinLengthPassword").subscribe(resp=>mensaje=resp);
      }
      if(this.email?.errors?.minlength){
        this.translate.get("Error.MinLengthEmail").subscribe(resp=>mensaje=resp);
      }
      if(this.email?.errors?.pattern){
        this.translate.get("Error.InvalidEmail").subscribe(resp=>mensaje=resp);
      }
      if(this.name?.errors?.minlength){
        this.translate.get("Error.MinUserName").subscribe(resp=>mensaje=resp);
      }
      if(this.email?.errors?.required){
        this.translate.get("Error.EmailRequired").subscribe(resp=>mensaje=resp);
      }
      if(this.password?.errors?.required){
        this.translate.get("Error.PasswordRequired").subscribe(resp=>mensaje=resp);
      }
      if(this.name?.errors?.required){
        this.translate.get("Error.UserNameRequired").subscribe(resp=>mensaje=resp);
      }
      this.IonSlides.slideTo(0);
      this.activeSlide=0;
      this.presentToastWithOptions(mensaje);

      return ;
    }

    //Mostrar sniper de carga
    this.loadingService.present();

    //Crear usuario en Firebase
     this.auth.createUserWithEmailAndPassword(this.email.value,this.password.value)
       .then(userInfo=>{
         userInfo.user.sendEmailVerification()//Enviamos email de verificación
          .then(async ()=>{
            this.dbUsers=this.db.loadStore("users");

            //Agregar a firebaseStorage
            if(this.imgPath!=='../../../../assets/person.jpg'){
              const user={
                id:userInfo.user.uid,
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
                    imageUrlLoc:localImg
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

  next(){
    this.IonSlides.slideNext();
  }

  setLanguage(){
    if(this.miFormulario.get('language').value){
      this.translate.use(this.miFormulario.get('language').value);
      localStorage.setItem("language",this.miFormulario.get('language').value);
    }
  }
}
