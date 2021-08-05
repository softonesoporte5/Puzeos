import { FileSystemService } from './file-system.service';
import { AppService } from './../app.service';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { IAudioBlob } from './../chat/interfaces/audioBlob.interface';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { IMediaRecorder, MediaRecorder } from 'extendable-media-recorder';
import { Plugins, FilesystemDirectory } from '@capacitor/core';

const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class MediaRecorderService {

  mediaRecorder:IMediaRecorder;
  audioData:any[]=[];
  audioBlob:Blob;
  audio$=new Subject<IAudioBlob>();
  audioUrl:string;
  duration:string;
  userName:string;
  idChat:string;
  cancel:boolean;
  permiso=false;

  constructor(
    private firebaseStorageService:FirebaseStorageService,
    private appService:AppService,
    private fileSystemService: FileSystemService
  ) {
    const loadMedia=async ()=> {
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder=new MediaRecorder(stream);
        this.permiso=true;
      }catch(e){
        this.permiso=false;
      }
    };
    loadMedia();
   }

  async recorder(){
    this.mediaRecorder.start();

    this.mediaRecorder.ondataavailable=e=>{
      this.audioData.push(e.data);
      this.audioBlob =new Blob([...this.audioData], { 'type' : 'audio/ogg; codecs=opus' });

      if(!this.cancel){
        this.appService.convertBlobToBase64(this.audioBlob)
        .then((resp:string)=>{
          const name='audio'+new Date().valueOf()+'.ogg';
          this.fileSystemService.writeFile(resp, name, "Puzeos VoiceNotes/",true)
          .then(respUrl=>{
            if(respUrl){
              console.log(respUrl)
              Filesystem.readFile({
                path:'Puzeos/VoiceNotes/'+name,
                directory:FilesystemDirectory.ExternalStorage
              }).then(resp=>{
                const audioFile:IAudioBlob={
                  data:resp.data,
                  duration:this.duration
                };
                this.firebaseStorageService.uploadAudio(audioFile,this.userName,this.idChat,'Puzeos/VoiceNotes/'+name);
              }).catch(e=>console.log(e))
            }
          });
        },err=>console.log(err));
      }
      this.audioData=[];
    }
  }

  stop(duration:string,userName:string,idChat:string,cancel:boolean){
    this.userName=userName;
    this.idChat=idChat;
    this.duration=duration;
    this.cancel=cancel;
    this.mediaRecorder.stop();
  }
}
