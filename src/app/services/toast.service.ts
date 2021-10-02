import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastController: ToastController
  ) { }

  async presentToast(text:string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
}
