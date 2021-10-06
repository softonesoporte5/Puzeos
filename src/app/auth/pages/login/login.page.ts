import { IUserData } from './../../../interfaces/user.interface';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from 'src/app/services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular-i18n';
import { StoreNames } from 'src/app/enums/store-names.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../../auth.scss'],
})
export class LoginPage implements OnInit, AfterViewInit {

  continuePhone=false;
  language="en";
  @ViewChild("animation") animation: HTMLDivElement;

  constructor(
    private router:Router,
    private loadingService:LoadingService,
    private firestore:AngularFirestore,
    private db:DbService,
    private translate: TranslateService,
    private auth:AngularFireAuth,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.language=localStorage.getItem("language") || 'en';
  }

  ngAfterViewInit() {
    setTimeout(()=>{
      const contAnimation=document.querySelector(".js-animation");
      let cont=0;
      const titles=contAnimation.querySelectorAll("h1");
      setInterval(()=>{
        contAnimation.classList.add("h-0")
        setTimeout(()=>{
          titles[cont].classList.add("d-none");
          cont++;
          if(cont+1===titles.length) cont=0;
          titles[cont].classList.remove("d-none");
          contAnimation.classList.remove("h-0")
        },500);
      },5000);

    },220);
  }

  skipRegister(){
    this.loadingService.present();
    this.auth.signInAnonymously()
    .then(resp=>{
      this.loadingService.dismiss();
      this.router.navigate(['auth/register']);
    }).catch(e=>{
      this.loadingService.dismiss();
      this.translate.get("Error.ContinueError").subscribe(resp=>{
        this.presentToast(resp);
      });
    })
  }

  async presentToast(mensaje:string){
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 5000,
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

  setLanguage(){
    if(this.language){
      localStorage.setItem("language",this.language);
      this.translate.use(this.language);
      this.translate.get("Global.ChangeLanguage").subscribe(resp=>{
        alert(resp);
      });
    }
  }

  checkUserState(data: FirebaseUISignInSuccessWithAuthResult){
    this.loadingService.present();
    try{
      let subscribe=this.firestore.collection("users").doc(data.authResult.user.uid).get()
      .subscribe(resp=>{
        subscribe.unsubscribe();
        this.loadingService.dismiss();
        const userData=resp.data() as IUserData;
        if(!resp.exists && userData===undefined){
          this.router.navigate(['auth/register']);
        }else{
          const userData=resp.data() as IUserData;
          this.db.loadStore(StoreNames.Users)
          .setItem(resp.id,userData)
          .then(()=>{
            this.router.navigate(['chat']);
          })
        }
        this.loadingService.dismiss();
      });
    }catch(e){
      this.loadingService.dismiss();
      this.translate.get("Error.Error").subscribe(resp=>{
        this.presentToast(resp);
      });
    }
  }
}

