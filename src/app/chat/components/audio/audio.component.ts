import { AppService } from './../../../app.service';
import { ILocalForage } from './../../interfaces/localForage.interface';
import { FirebaseStorageService } from './../../../services/firebase-storage.service';
import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {Howl} from 'howler';
import { IonRange } from '@ionic/angular';
import {Plugins, FilesystemDirectory, FilesystemEncoding} from '@capacitor/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
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
  descargar:number=1;
  downloadProgress=0;
  downloadUrl:string;
  messageDB:IMessage;
  pruebaUrl;

  constructor(
    private http:HttpClient,
    private firebaseService:FirebaseStorageService,
    private appService:AppService
  ) { }

  ngOnInit() {
    this.dbMessages.getItem(this.audio.id)
    .then((message:IMessage)=>{
      if(message){
        this.messageDB=message;
        if(message.download===false){
          this.descargar=1;
        }else{
          this.descargar=3;

          Filesystem.readFile({
            path:this.audio.ref,
            directory:FilesystemDirectory.Documents
          }).then(resp=>{
            this.controls(resp.data);
          }).catch(err=>console.log(err));
        }
      }else{
        this.descargar=1;
      }

    }).catch(error=>{
      console.log(error);
    });
  }

  downloadFile(){
    console.log("Descargando...");
    this.descargar=2;
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
          this.appService.convertBlobToBase64(event.body)
          .then((result:string | ArrayBuffer)=>{
            base64=result;

            Filesystem.writeFile({
              path:'audio/'+name,
              data:base64,
              directory:FilesystemDirectory.Documents,
              encoding: FilesystemEncoding.UTF8
            }).then(()=>{
              this.descargar=3;

              Filesystem.readFile({
                path:'audio/'+name,
                directory:FilesystemDirectory.Documents
              }).then(resp=>{
                this.controls(resp.data);
              }).catch(err=>console.log(err));

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
