import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  constructor(
    private router:Router
  ) { }

  ngOnInit(
  ) {}

  logout(){
    this.router.navigate(['auth/login']);
  }

}
