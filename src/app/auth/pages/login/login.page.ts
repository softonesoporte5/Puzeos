import { IUserData } from './../../../chat/interfaces/user.interface';
import { DbService } from 'src/app/services/db.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular-i18n';
import { StoreNames } from 'src/app/enums/store-names.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../../auth.scss'],
})
export class LoginPage implements OnInit {

  language="es";

  constructor(
    private router:Router,
    private loadingService:LoadingService,
    private firestore:AngularFirestore,
    private db:DbService
  ) {}

  ngOnInit() {
  }

  checkUserState(data: FirebaseUISignInSuccessWithAuthResult){
    this.loadingService.present();
    try{
      this.firestore.collection("users").doc(data.authResult.user.uid).get()
      .subscribe(resp=>{
        this.loadingService.dismiss();
        if(!resp.exists){
          console.log("ewq")
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

