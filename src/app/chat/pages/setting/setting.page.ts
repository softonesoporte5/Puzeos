import { ISettings } from './../../interfaces/settings.interface';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  toogleDarkMode:boolean=false;
  languageSelect:string;
  searchLanguageSelect:string;

  constructor() {
    this.languageSelect=localStorage.getItem("language");
    this.searchLanguageSelect=localStorage.getItem("searchLanguage");
  }

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

  setLanguage(){
    if(this.languageSelect){
      localStorage.setItem("language",this.languageSelect);
    }
  }

  setSearchLanguage(){
    if(this.searchLanguageSelect){
      localStorage.setItem("searchLanguage",this.searchLanguageSelect);
    }
  }
}
