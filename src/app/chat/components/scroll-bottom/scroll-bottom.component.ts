import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-scroll-bottom',
  templateUrl: './scroll-bottom.component.html',
  styleUrls: ['./scroll-bottom.component.scss'],
})
export class ScrollBottomComponent implements OnInit {

  @Input() content:HTMLElement;
  constructor() { }

  ngOnInit() {}

  scrollToBottom(){
    this.content.scrollTop=this.content.scrollHeight;
  }

}
