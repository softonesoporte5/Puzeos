import { LoadingService } from './../../../services/loading.service';
import { ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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
    private loadingService:LoadingService,
    private translate: TranslateService
  ) {
    this.translate.use('en');
   }

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
      if(this.email?.errors?.required){
        this.translate.get("Error.EmailRequired").subscribe(resp=>mensaje=resp);
      }
      if(this.email?.errors?.pattern){
        this.translate.get("Error.InvalidEmail").subscribe(resp=>mensaje=resp);
      }
      if(this.email?.errors?.minlength){
        this.translate.get("Error.MinLengthEmail").subscribe(resp=>mensaje=resp);
      }
      if(this.password?.errors?.required){
        this.translate.get("Error.PasswordRequired").subscribe(resp=>mensaje=resp);
      }
      if(this.password?.errors?.minlength){
        this.translate.get("Error.MinLengthPassword").subscribe(resp=>mensaje=resp);
      }

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
          this.translate.get("Error.UserNotFound").subscribe(resp=>{
            this.presentToastWithOptions(resp);
          });
        }if(error.code==="auth/wrong-password"){
          this.translate.get("Error.WrongPassword").subscribe(resp=>{
            this.presentToastWithOptions(resp);
          });
        }
      });

  }

}
