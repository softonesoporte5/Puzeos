import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { ToastController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Plugins, } from '@capacitor/core';
import * as firebase from 'firebase';

const { App } = Plugins;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../../auth.scss'],
})
export class LoginPage implements OnInit {

  private _emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  miFormulario:FormGroup=this.fb.group({
    email:['',[Validators.pattern(this._emailPattern),Validators.required,Validators.minLength(6)]],
  });

  get email(){ return this.miFormulario.get('email'); }
  // get password(){ return this.miFormulario.get('password'); }

  link="";

  constructor(
    private fb:FormBuilder,
    private toastController: ToastController,
    private auth:AngularFireAuth,
    private router:Router,
    private loadingService:LoadingService,
    private translate: TranslateService,
    private firestore:AngularFirestore,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const email=localStorage.getItem("emailForSignIn");
    if(email){
      this.email.setValue(email);
    }

    App.getLaunchUrl().then(resp=>{
      if(resp.url){
        console.log(resp.url)
        this.link=resp.url;
      }
    },e=>console.log(e));

    if(this.auth.isSignInWithEmailLink(this.link) && email){
      this.enviar();
    }

    if(firebase.default.auth()?.currentUser?.uid){
      this.router.navigate(['auth/register']);
    }
  }

  async presentToastWithOptions(mensaje:string){//Mostrar notificaciones internas sobre errores del formulario
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
      if(this.email?.errors?.required){
        this.translate.get("Error.EmailRequired").subscribe(resp=>mensaje=resp);
      }
      if(this.email?.errors?.pattern){
        this.translate.get("Error.InvalidEmail").subscribe(resp=>mensaje=resp);
      }
      if(this.email?.errors?.minlength){
        this.translate.get("Error.MinLengthEmail").subscribe(resp=>mensaje=resp);
      }
      this.presentToastWithOptions(mensaje);

      return ;
    }

    //Mostrar spiner de carga
    this.loadingService.present();

    if(this.auth.isSignInWithEmailLink(this.link) && this.link!==""){
      console.log("Entró")
      this.auth.signInWithEmailLink(this.email.value,this.link)
      .then((userInfo) => {
        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');

        this.firestore.collection("users").doc(userInfo.user.uid).get()
        .subscribe(resp=>{
          if(!resp.exists){
            this.router.navigate(['auth/register']);
          }else{
            this.router.navigate(['chat']);
          }
        });
        this.loadingService.dismiss();
      })
      .catch((error) => {
        this.loadingService.dismiss();
        console.log(error)
      });
    }else{
      this.auth.sendSignInLinkToEmail(this.email.value,{
        url:'http://usuarios-6b56a.web.app',
        handleCodeInApp: true,
        android: {
          packageName: 'com.puzeos.puzeos',
          installApp: true,
        },
        dynamicLinkDomain: 'puzeos.page.link'
      }).then(()=>{
        localStorage.setItem('emailForSignIn', this.email.value);
        this.presentAlert();
      },err=>console.log(err));
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      message: 'Se ha enviado un enlace de verificación al correo ingresado. <br> <br>Ingresa a tu correo y haz click en el enlace para poder iniciar sesión.',
      buttons: ['OK']
    });

    await alert.present();
    await alert.onDidDismiss();
  }
}

