import { ILocalForage } from './../../interfaces/localForage.interface';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit, SecurityContext, ViewChild } from '@angular/core';
import {Howl} from 'howler';
import { IonRange } from '@ionic/angular';
import {Plugins, FilesystemDirectory, FilesystemEncoding, FileWriteResult} from '@capacitor/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
const {Filesystem} = Plugins;

const FILE_KEY='files';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit {

  @Input() audio:IMessage;
  @Input() dbMessages:ILocalForage;
  progress=0;
  player:Howl;
  pause:boolean=true;
  @ViewChild('range') range:IonRange;
  interval:any;
  descargar:boolean=true;
  downloadProgress=0;
  downloadUrl:string;
  messageDB:IMessage;
  pruebaUrl;

  constructor(
    private http:HttpClient,
    private firebaseService:FirebaseStorageService,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.dbMessages.getItem(this.audio.id)
    .then((message:IMessage)=>{
      if(message){
        this.messageDB=message;
        if(message.download===false){
          this.descargar=true;
        }else{
          this.descargar=false;

          Filesystem.readFile({
            path:this.audio.ref,
            directory:FilesystemDirectory.Documents
          }).then(resp=>{
            let url=this.domSanitizer.sanitize(SecurityContext.NONE,resp.data);
            this.controls(url);
          }).catch(err=>console.log(err));

        }
      }else{
        this.descargar=true;
      }

    }).catch(error=>{
      console.log(error);
    });
  }

  private convertBlobToBase64=(blob:Blob)=>new Promise((resolve,reject)=>{
    console.log("linea 69")
    const reader=new FileReader;
    reader.onerror=reject;
    reader.onload=()=>resolve(reader.result);
    reader.readAsDataURL(blob);
    console.log("linea 74")
  });

  downloadFile(){
    console.log("Descargando...");
    this.firebaseService.getAudio(this.audio.ref).
    subscribe(resul=>{
      console.log("linea 80")
      this.downloadUrl=resul;
      this.http.get(this.downloadUrl,{
        responseType:'blob',
        reportProgress:true,
        observe:'events'
      }).subscribe(async event=>{
        console.log("linea 87")

        if(event.type===HttpEventType.DownloadProgress){
          console.log("linea 90")

          this.downloadProgress=Math.round((100*event.loaded)/event.total);
        }else if(event.type===HttpEventType.Response){
          console.log("linea 94")

          this.downloadProgress=0;

          let base64;

          const name='audio'+this.audio.id+'.ogg';
          this.convertBlobToBase64(event.body)
          .then(result=>{
            base64=result;

            Filesystem.writeFile({
              path:'audio/'+name,
              data:base64,
              directory:FilesystemDirectory.Documents,
              encoding: FilesystemEncoding.UTF8
            }).then((resp:FileWriteResult)=>{



              this.dbMessages.setItem(this.audio.id,{
                ...this.audio,
                download:true,
                ref:'audio/'+name
              }).catch(err=>console.log(err));
            }).catch(err=>console.log(err));
          }).catch(err=>console.log(err));
        }
      });
    });
  }

  controls(src:string):Howl{
    this.player=new Howl({
      src: [src],
      format:'ogg',
      onplay:()=>{
        this.updateProgress();
      },
      onpause:()=>{
        clearInterval(this.interval);
      },
      onend:()=>{
        this.pause=true;
        clearInterval(this.interval);
      }
    });
  }

  setPause(){
    this.pause=false;
    this.tooglePlayer();
  }

  tooglePlayer(){
    if(this.pause){
      this.player.play();
    }else{
      this.player.pause();
    }
    this.pause=!this.pause;
  }

  seek(){
    let newValue=+this.range.value;
    let duration=this.player.duration();
    this.player.seek(duration*(newValue/100));
    this.pause=true;
    this.tooglePlayer();
  }

  updateProgress(){
    let seek=this.player.seek();
    this.progress=(seek/this.player.duration())*100 || 0;
    this.interval=setTimeout(()=>{
      this.updateProgress();
    },100);
  }
}
