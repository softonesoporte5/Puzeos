import { FileSystemService } from './../../../services/file-system.service';
import { Subscription } from 'rxjs';
import { ImageModalComponent } from './../image-modal/image-modal.component';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { AppService } from './../../../app.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit } from '@angular/core';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { ModalController } from '@ionic/angular';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
const {Filesystem} = Plugins;
import { Capacitor } from '@capacitor/core';


@Component({
  selector: 'app-image-message',
  templateUrl: './image-message.component.html',
  styleUrls: ['./image-message.component.scss'],
})
export class ImageMessageComponent implements OnInit {

  @Input() image:IMessage;
  @Input() userName:string;
  @Input() dbMessages:ILocalForage;
  imageUrl:string;
  downloaded:boolean=false;
  units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  size:string;
  storageSubscribe:Subscription;
  httpSubscribe:Subscription;
  uploaded=false;

  constructor(
    private storageService:FirebaseStorageService,
    private http:HttpClient,
    private appService:AppService,
    private modal:ModalController,
    private fileSystemService:FileSystemService
  ) { }

  ngOnInit(){
    if(this.image.user===this.userName){
      //Obtener la URL del archivo
      this.imageUrl=Capacitor.convertFileSrc(this.image.localRef);
    }else{
      if(this.image.download===false){
        this.size=this.niceBytes(this.image.size);
      }else{
        this.imageUrl=Capacitor.convertFileSrc(this.image.localRef);
      }
    }

    if(this.storageService.uploads[this.image.id]){
      this.uploaded=true;
      this.storageService.uploads[this.image.id].percentageChanges()
      .subscribe(resp=>{
        const progressBar=document.querySelector("svg.upload circle:nth-child(2)") as HTMLElement;
        progressBar.style.strokeDashoffset=`calc(60 - (60 * ${resp})/100)`;
      });
    }
  }

  cancelUpload(){
    if(this.storageService.uploads[this.image.id]){
      this.uploaded=false;
      this.storageService.uploads[this.image.id].cancel();
    }
  }

  reUpload(){
    this.uploaded=true;
    Filesystem.readFile({
      path:this.image.localRef
    }).then(resp=>{
      this.appService.reUploadFile(resp.data,this.image);
      if(this.storageService.uploads[this.image.id]){
        this.storageService.uploads[this.image.id].percentageChanges()
        .subscribe(resp=>{
          const progressBar=document.querySelector("svg.upload circle:nth-child(2)") as HTMLElement;
          progressBar.style.strokeDashoffset=`calc(60 - (60 * ${resp})/100)`;
        });
      }
    })
  }

  downloadImage(){
    this.downloaded=true;
    this.storageSubscribe=this.storageService.getUrlFile(this.image.ref)
    .subscribe(downloadUrl=>{
      this.httpSubscribe=this.http.get(downloadUrl,{
        responseType:'blob',
        reportProgress:true,
        observe:'events'
      }).subscribe(async event=>{

        if(event.type===HttpEventType.DownloadProgress){
          const progressBar=document.querySelector("svg.download circle:nth-child(2)") as HTMLElement;
          progressBar.style.strokeDashoffset=`calc(60 - (60 * ${Math.round((100*event.loaded)/event.total)})/100)`;
        }else if(event.type===HttpEventType.Response){
          let base64;
          const date=new Date().valueOf();
          const randomId=Math.round(Math.random()*1000)+date;
          const reader=new FileReader;
          console.log(reader)

          this.appService.convertBlobToBase64(event.body)
          .then((result:string | ArrayBuffer)=>{
            base64=result;

            this.fileSystemService.writeFile(base64,randomId+".jpeg", "Puzeos Images/")
            .then(respUrl=>{
              if(respUrl){
                this.dbMessages.setItem(this.image.id,{
                  ...this.image,
                  localRef:respUrl,
                  download:true
                }).then(()=>{
                  this.image.download=true
                  this.imageUrl=Capacitor.convertFileSrc(respUrl);

                  this.storageSubscribe.unsubscribe();
                  this.httpSubscribe.unsubscribe();
                }).catch(err=>console.log(err));
              }
            });
          }).catch(err=>console.log(err));
        }
      });
    })
  }

  openModal(){
    this.modal.create({
      component:ImageModalComponent,
      componentProps:{
        path:this.imageUrl,
        type:this.image.type
      }
    }).then(modal=>modal.present());
  }

  cancelDownload(){
    this.downloaded=false;
    if(this.storageSubscribe){
      this.storageSubscribe.unsubscribe();
    }
    if(this.httpSubscribe){
      this.httpSubscribe.unsubscribe();
    }
  }

  niceBytes(x:number){
    let l = 0, n = x || 0;
    while(n >= 1024 && ++l){
        n = n/1024;
    }
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + this.units[l]);
  }
}
