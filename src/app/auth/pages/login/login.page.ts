import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from './../../../services/loading.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
    private angularFireAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.angularFireAuth.authState.subscribe(resp=>{
      if (resp) {
        this.loadingService.present();
        this.firestore.collection("users").doc(resp.uid).get()
        .subscribe(resp=>{
          this.loadingService.dismiss();
          if(!resp.exists){
            this.router.navigate(['auth/register']);
          }else{
            this.router.navigate(['chat']);
          }
        });
        this.loadingService.dismiss();
      }else {
        console.log('Logged out :(');
      }
    });
  }
}

