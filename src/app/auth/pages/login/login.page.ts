import { TranslateService } from '@ngx-translate/core';
import { IUserData } from './../../../chat/interfaces/user.interface';
import { DbService } from 'src/app/services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular-i18n';
import { StoreNames } from 'src/app/enums/store-names.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../../auth.scss'],
})
export class LoginPage implements OnInit {

  welcome=false;
  language="es";

  constructor(
    private router:Router,
    private loadingService:LoadingService,
    private firestore:AngularFirestore,
    private db:DbService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.language=localStorage.getItem("language");

    if(localStorage.getItem("skipIntro")){
      this.welcome=false;
    }else{
      this.welcome=true;
    }
  }

  skipIntro(){
    this.welcome=false;
    localStorage.setItem("skipIntro","true");
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
      console.log(data.authResult.user.uid);
      let subscribe=this.firestore.collection("users").doc(data.authResult.user.uid).get()
      .subscribe(resp=>{
        subscribe.unsubscribe();
        this.loadingService.dismiss();
        console.log(resp);
        const userData=resp.data() as IUserData;
        if(!resp.exists && userData.userName){
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
      alert("Ha ocuurido un error");
    }
  }
}

