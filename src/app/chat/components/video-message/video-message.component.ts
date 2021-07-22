import { IMessage } from './../../interfaces/message.interface';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { Component, OnInit, Input } from '@angular/core';
import { ImageModalComponent } from './../image-modal/image-modal.component';
import { AppService } from './../../../app.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { ModalController } from '@ionic/angular';
import {Plugins, FilesystemDirectory} from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
const {CapacitorVideoPlayer, Filesystem} = Plugins;

@Component({
  selector: 'app-video-message',
  templateUrl: './video-message.component.html',
  styleUrls: ['./video-message.component.scss'],
})
export class VideoMessageComponent implements OnInit {

  @Input() video:IMessage;
  @Input() userName:string;
  @Input() dbMessages:ILocalForage;
  imageUrl:string;
  downloaded:boolean=false;
  units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  size:string;

  constructor(
    private storageService:FirebaseStorageService,
    private http:HttpClient,
    private appService:AppService,
    private modal:ModalController
  ) { }

  ngOnInit(){

    if(this.video.user===this.userName){
      //Obtener la URL del archivo
      this.imageUrl=Capacitor.convertFileSrc(this.video.localRef)+"#t=0.5";
    }else{
      if(this.video.download===false){
        this.size=this.niceBytes(this.video.size);
      }else{
        this.imageUrl=Capacitor.convertFileSrc(this.video.localRef)+"#t=0.5";
      }
    }
  }

  downloadVideo(){
    this.downloaded=true;
    let storageSubscribe=this.storageService.getImage(this.video.ref)
    .subscribe(downloadUrl=>{
      let httpSubscribe=this.http.get(downloadUrl,{
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
              path:randomId+'.mp4',
              data:base64,
              directory:FilesystemDirectory.Data
            }).then(resp=>{
              this.dbMessages.setItem(this.video.id,{
                ...this.video,
                localRef:resp.uri,
                download:true
              }).then(()=>{
                this.video.download=true
                this.imageUrl=Capacitor.convertFileSrc(resp.uri);

                storageSubscribe.unsubscribe();
                httpSubscribe.unsubscribe();
              }).catch(err=>console.log(err));
            }).catch(err=>console.log(err));
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
        type:this.video.type
      }
    }).then(modal=>modal.present());
  }

  niceBytes(x:number){
    let l = 0, n = x || 0;
    while(n >= 1024 && ++l){
        n = n/1024;
    }
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + this.units[l]);
  }

}
