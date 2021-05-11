import { DbService } from './../../../services/db.service';
import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {Howl, Howler} from 'howler';
import { IonRange } from '@ionic/angular';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit {

  @Input() audio:IMessage;
  progress=0;
  player:Howl;
  pause:boolean=true;
  @ViewChild('range') range:IonRange;
  interval:any;
  dbMessages:any;
  descargar:boolean=true;

  constructor(
    private db:DbService
  ) { }

  ngOnInit() {
    this.dbMessages=this.db.cargarDB("messages");
    this.dbMessages.get(this.audio._id)
    .then(message=>{
      this.descargar=false;
      this.controls(this.audio.ref);
    }).catch(error=>{
      this.descargar=true;
    });
  }

  controls(src:string):Howl{
    this.player=new Howl({
      src: [src],
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
