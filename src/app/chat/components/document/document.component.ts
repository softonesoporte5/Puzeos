import { Subscription } from 'rxjs';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { AppService } from './../../../app.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit } from '@angular/core';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { ModalController } from '@ionic/angular';
import {Plugins, FilesystemDirectory} from '@capacitor/core';
const {Filesystem} = Plugins;
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit {

  @Input() document:IMessage;
  @Input() userName:string;
  @Input() dbMessages:ILocalForage;
  documentUrl:string;
  downloaded:boolean=false;
  units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  size:string;
  storageSubscribe:Subscription;
  httpSubscribe:Subscription;

  constructor(
    private storageService:FirebaseStorageService,
    private http:HttpClient,
    private appService:AppService,
    private fileOpener: FileOpener
  ) { }

  ngOnInit(){
    if(this.document.user===this.userName){
      //Obtener la URL del archivo
      this.size=this.niceBytes(this.document.size);
      this.documentUrl=Capacitor.convertFileSrc(this.document.localRef);
    }else{
      if(this.document.download===false){
        this.size=this.niceBytes(this.document.size);
      }else{
        this.documentUrl=Capacitor.convertFileSrc(this.document.localRef);
      }
    }
  }

  downloadDocument(){
    this.downloaded=true;
    this.storageSubscribe=this.storageService.getImage(this.document.ref)
    .subscribe(downloadUrl=>{
      this.httpSubscribe=this.http.get(downloadUrl,{
        responseType:'blob',
        reportProgress:true,
        observe:'events'
      }).subscribe(async event=>{

        if(event.type===HttpEventType.DownloadProgress){
          const progressBar=document.querySelector("svg circle:nth-child(2)") as HTMLElement;
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
            Filesystem.writeFile({
              path:randomId+'.jpeg',
              data:base64,
              directory:FilesystemDirectory.Data
            }).then(resp=>{
              this.dbMessages.setItem(this.document.id,{
                ...this.document,
                localRef:resp.uri,
                download:true
              }).then(()=>{
                this.document.download=true
                this.documentUrl=Capacitor.convertFileSrc(resp.uri);

                this.storageSubscribe.unsubscribe();
                this.httpSubscribe.unsubscribe();
              }).catch(err=>console.log(err));
            }).catch(err=>console.log(err));
          }).catch(err=>console.log(err));
        }
      });
    })
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

  openDocument(){
    console.log(this.document.mimeType)
    this.fileOpener.open(this.document.localRef, this.document.mimeType)
    .then(() => console.log('File is opened'))
    .catch(e => console.log('Error opening file', e));
  }

  niceBytes(x:number){
    let l = 0, n = x || 0;
    while(n >= 1024 && ++l){
        n = n/1024;
    }
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + this.units[l]);
  }
}
