import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class CompleteRegisterGuard implements CanActivate {

  uid:string;

  constructor(private router: Router){

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      return new Promise((resolve,rejeact)=>{
        console.log("f")
        firebase.default.auth().onAuthStateChanged((user) => {
          console.log("aqe")
            if(user && user?.uid){
              resolve(true);
            }else{
              this.router.navigate(['/auth/login']);
              resolve(false);
            }
        });
      });
  }

}
