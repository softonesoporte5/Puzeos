import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingService } from './../../../services/loading.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { ToastService } from './../../../services/toast.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage implements OnInit {

  imageURL: any;
  @ViewChild('fileButton', { static: false }) fileButton;
  description: string="";

  constructor(
    private toast: ToastService,
    private storage: AngularFireStorage,
    private loadingService: LoadingService,
    private firestore: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit() {
  }

  uploadFile() {
    this.fileButton.nativeElement.click();
  }

  fileChanged(event) {
    const files = event.target.files;
    console.log(files);
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  async send(){
    if(this.description.trim()){
      this.loadingService.present();

      if(this.imageURL){
        const date=new Date().valueOf();
        const randomId="a"+Math.round(Math.random()*1000)+''+date;
        const refUrl=`report/${randomId}.jpg`;
        const ref = this.storage.ref(refUrl);

        ref.putString(this.imageURL, 'data_url')
        .then(()=>{
          this.firestore.collection("report").add({
            ref: refUrl,
            description: this.description
          }).then(()=>{
            this.loadingService.dismiss();
            alert("Se ha enviado el reporte");
            this.router.navigate(["chat"]);
          },()=>{
            this.loadingService.dismiss();
            this.toast.presentToast("Ha ocurrido un error");
          })
        },()=>{
          this.loadingService.dismiss();
          this.toast.presentToast("Error al tratar de enviar el archivo");
        })
      }else{
        this.firestore.collection("report").add({
          description: this.description
        }).then(()=>{
          this.loadingService.dismiss();
          alert("Se ha enviado el reporte");
          this.router.navigate(["chat"]);
        },()=>{
          this.loadingService.dismiss();
          this.toast.presentToast("Ha ocurrido un error");
        })
      }
    }else{
      this.loadingService.dismiss();
      this.toast.presentToast("La descripción es obligatoria");
    }
  }

}
