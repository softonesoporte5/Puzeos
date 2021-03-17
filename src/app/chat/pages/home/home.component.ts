import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  user:any;

  constructor(
    private menu: MenuController,
    private auth:AngularFireAuth,
    private router:Router
  ) { }

  ngOnInit() {
    this.auth.onAuthStateChanged(user=>{
      this.user=user;
      console.log(user)
    })
  }

  openMenu(){
    const open=async()=> {
      await this.menu.open();
    }
    open();
  }

  logout(){
    this.auth.signOut()
      .then(resp=>{
        this.router.navigate(['auth/login']);
      })
      .catch(error=>{

      });
  }

}
