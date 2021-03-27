import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  user:any;

  constructor(
    private menu: MenuController,
  ) { }

  ngOnInit() {

  }

  openMenu(){
    const open=async()=> {
      await this.menu.open();
    }
    open();
  }

}
