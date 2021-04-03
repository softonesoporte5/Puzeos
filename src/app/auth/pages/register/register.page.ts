import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../../auth.scss'],
})
export class RegisterPage implements OnInit {

  private _emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  miFormulario:FormGroup=this.fb.group({
    name:['',[Validators.required,Validators.minLength(10)]],
    email:['',[Validators.pattern(this._emailPattern),Validators.required,Validators.minLength(6)]],
    passwords:this.fb.group({
      password:['', [Validators.required,Validators.minLength(9)]],
      password2:['',[Validators.required]],
    },{validators:this.passwordMatchValidator})
  });

  get name(){ return this.miFormulario.get('name'); }
  get email(){ return this.miFormulario.get('email'); }
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
    private fireStore:AngularFirestore
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
      if(this.name?.errors?.required){mensaje='El campo "Nombre Completo" es requerido';}
      if(this.name?.errors?.minlength){mensaje='El nombre completo debe tener al menos 10 caracteres';}
      if(this.email?.errors?.required){mensaje='El correo es requerido';}
      if(this.email?.errors?.pattern){mensaje='Introduzca una dirección de correo válida';}
      if(this.email?.errors?.minlength){mensaje='El correo debe tener al menos 6 caracteres';}
      if(this.password?.errors?.required){mensaje='La contraseña es requerida';}
      if(this.password?.errors?.minlength){mensaje='La contraseña debe tener al menos 9 caracteres';}
      if(this.password2?.errors?.required){mensaje='El campo "Confirmar contraseña" es requerido';}
      if(this.miFormulario.get('passwords')?.errors?.mismatch){mensaje='Las constraseñas no coinciden';}

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
            this.loadingService.dismiss();

            this.fireStore.collection("users").doc(userInfo.user.uid).set({//Agregamos el usuario a FireStorage
              userName:this.name.value,
              chats:[],
              buscando:{
                state:false,
                tagId:''
              }
            });

            this.router.navigate(['chat']);
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

}
