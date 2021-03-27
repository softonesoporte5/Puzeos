import { LoadingService } from './../../../services/loading.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../../auth.scss'],
})
export class LoginPage implements OnInit {

  private _emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  miFormulario:FormGroup=this.fb.group({
    email:['',[Validators.pattern(this._emailPattern),Validators.required,Validators.minLength(6)]],
    password:['', [Validators.required,Validators.minLength(9)]]
  });

  get email(){ return this.miFormulario.get('email'); }
  get password(){ return this.miFormulario.get('password'); }

  constructor(
    private fb:FormBuilder,
    private toastController: ToastController,
    private auth:AngularFireAuth,
    private router:Router,
    private loadingService:LoadingService
  ) { }

  ngOnInit() {}

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
      if(this.email?.errors?.required){mensaje='El correo es requerido';}
      if(this.email?.errors?.pattern){mensaje='Introduzca una dirección de correo válida';}
      if(this.email?.errors?.minlength){mensaje='El correo debe tener al menos 6 caracteres';}
      if(this.password?.errors?.required){mensaje='La contraseña es requerida';}
      if(this.password?.errors?.minlength){mensaje='La contraseña debe tener al menos 9 caracteres';}

      this.presentToastWithOptions(mensaje);

      return ;
    }

    //Mostrar spiner de carga
    this.loadingService.present();

    this.auth.signInWithEmailAndPassword(this.email.value,this.password.value)
      .then(resp=>{
        this.loadingService.dismiss();
        this.router.navigate(['chat']);

      }).catch(error=>{
        this.loadingService.dismiss();

        if(error.code==="auth/user-not-found"){
          this.presentToastWithOptions("Ningún usuario asociado a este correo");
        }if(error.code==="auth/wrong-password"){
          this.presentToastWithOptions("Contraseña incorrecta");
        }
      });

  }

}
