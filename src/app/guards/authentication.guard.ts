import { IUserData } from './../interfaces/user.interface';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {DbService} from '../services/db.service';
import * as firebase from 'firebase';
import { StoreNames } from '../enums/store-names.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  user:IUserData;

  constructor(
    private db:DbService,
    private router:Router
  ){

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      return new Promise((resolve,rejeact)=>{
        firebase.default.auth().onAuthStateChanged((user) => {
          const localDb=this.db.loadStore(StoreNames.Users);
          localDb.getItem(user?.uid)
          .then(resp=>{
            if(route.data.module==="chat"){
              if(user && resp){
                resolve(true);
              }else{
                this.router.navigate(['/auth/login']);
                resolve(false);
              }
            }else{
              if(!resp){
                console.log("asad")
                resolve(true);
              }else{
                console.log("asad")
                this.router.navigate(['chat/']);
                resolve(false);
              }
            }
          })
        });
      });

  }

}
