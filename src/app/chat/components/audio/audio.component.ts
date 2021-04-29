import { IMessage } from './../../interfaces/message.interface';
import { Component, Input, OnInit } from '@angular/core';
import {Howl, Howler} from 'howler';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit {

  @Input() audio:IMessage;
  progress=0;
  sound:Howl;
  pause:boolean=true;

  constructor() { }

  ngOnInit() {
    this.controls(this.audio.ref);
  }

  controls(src:string):Howl{
    this.sound=new Howl({
      //src: [src]
    });
  }

  tooglePlayer(){
    this.pause=!this.pause;

    if(this.pause){
      this.sound.play();
    }else{
      this.sound.pause();
    }
  }

  updateProgress(){

  }
}
