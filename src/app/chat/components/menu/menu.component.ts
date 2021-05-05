import { CameraService } from './../../../services/camera.service';
import { IUser } from './../../interfaces/user.interface';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  @Input() user:IUser;

  constructor(
    private router:Router,
    private auth:AngularFireAuth,
    private actionSheetController: ActionSheetController,
    private camara:CameraService
  ) { }

  ngOnInit() {}

  logout(){
    this.auth.signOut()
      .then(resp=>{
        this.router.navigate(['auth/login']);
      }).catch(error=>{
        console.log(error);
      });
  }

  tomarFoto(){

  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Cambiar foto de perfil',
          icon: 'image-sharp',
          handler: () => {
            this.camara.takePicture();
          }
        },
        {
          text: 'Quitar foto de perfil',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            console.log('Delete clicked');
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  opcImg(){
    this.presentActionSheet();
  }

}
