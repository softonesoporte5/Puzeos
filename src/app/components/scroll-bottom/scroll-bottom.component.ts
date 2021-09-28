import { Component, Input, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-scroll-bottom',
  templateUrl: './scroll-bottom.component.html',
  styleUrls: ['./scroll-bottom.component.scss'],
})
export class ScrollBottomComponent implements OnInit {

  @Input() content:IonContent;
  constructor() { }

  ngOnInit() {}

  scrollToBottom(){
    this.content.scrollToBottom();
  }

}
