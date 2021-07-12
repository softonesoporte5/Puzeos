import { ISettings } from './../../interfaces/settings.interface';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  toogleDarkMode:boolean=false;

  constructor() { }

  ngOnInit() {
    const settings = JSON.parse(localStorage.getItem("settings")) as ISettings;
    if(settings?.darkMode){
      this.toogleDarkMode=true;
    }
  }

  toogleDark(){
    if(this.toogleDarkMode){
      document.body.classList.add("dark");
      let settings = JSON.parse(localStorage.getItem("settings")) as ISettings;
      settings={...settings, darkMode:true}
      localStorage.setItem("settings",JSON.stringify(settings));
    }else{
      document.body.classList.remove("dark");
      let settings = JSON.parse(localStorage.getItem("settings")) as ISettings;
      settings={...settings, darkMode:false}
      localStorage.setItem("settings",JSON.stringify(settings));
    }
  }



}
