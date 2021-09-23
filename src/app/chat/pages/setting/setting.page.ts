import { LoadingService } from './../../../services/loading.service';
import { ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { TranslateService } from '@ngx-translate/core';
import { ISettings } from './../../interfaces/settings.interface';
import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  toogleDarkMode:boolean=false;
  languageSelect:string;
  searchLanguageSelect:string;
  verification=false;
  recaptchaVerifier: firebase.default.auth.RecaptchaVerifier;
  confirmationResult:firebase.default.auth.ConfirmationResult;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.UnitedStates];
  connectedAccount=false;
  form=this.fb.group({
    phone:['',[Validators.required]]
  });

  get phone(){ return this.form.get("phone")};

  constructor(
    private translate: TranslateService,
    private auth: AngularFireAuth,
    private fb: FormBuilder,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingService: LoadingService
  ) {
    this.languageSelect=localStorage.getItem("language");
    this.searchLanguageSelect=localStorage.getItem("searchLanguage");
  }

  ngOnInit() {
    firebase.default.auth().useDeviceLanguage();
    const settings = JSON.parse(localStorage.getItem("settings")) as ISettings;
    if(settings?.darkMode){
      this.toogleDarkMode=true;
    }

    if(firebase.default.auth().currentUser.phoneNumber){
      this.connectedAccount=true;
    }else{
      this.connectedAccount=false;
    }
  }

  async ionViewDidEnter() {
       this.recaptchaVerifier=new firebase.default.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // ...
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        // ...
      }
    });
  }
  ionViewDidLoad() {
       this.recaptchaVerifier=new firebase.default.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // ...
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        // ...
      }
    });
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
      this.translate.use(this.languageSelect);
      this.translate.get("Global.ChangeLanguage").subscribe(resp=>{
        alert(resp);
      });
    }
  }

  setSearchLanguage(){
    if(this.searchLanguageSelect){
      localStorage.setItem("searchLanguage",this.searchLanguageSelect);
    }
  }

  verifyPhone(){
    if (this.form.valid) {
      this.loadingService.present();
      this.auth.signInWithPhoneNumber(this.phone.value.e164Number, this.recaptchaVerifier)
        .then(async (confirmationResult)=>{
          this.confirmationResult=confirmationResult;
          this.loadingService.dismiss();
          this.presentAlert();
      }).catch((error) => {
        this.loadingService.dismiss();
        this.translate.get("Error.NotOTP").subscribe(resp=>{
          this.presentToast(resp);
        });
      });
    }else{
      if(this.phone?.errors?.required){
        this.translate.get("Error.PhoneRequired").subscribe(resp=>{
          this.presentToast(resp);
        });
      }
    }
  }

  async presentToast(mensaje:string){
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'top',
      duration: 7000,
      color:"danger",
      buttons: [
        {
          text: 'x',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  async presentAlert(){
    let cancelTxt='';
    this.translate.get("Global.Cancel").subscribe(resp=>cancelTxt=resp);
    let headerTxt='';
    this.translate.get("SettingPage.HeaderAlert").subscribe(resp=>headerTxt=resp);
    let placeholderTxt='';
    this.translate.get("SettingPage.InputPhoneLabel").subscribe(resp=>placeholderTxt=resp);
    let checkTxt='';
    this.translate.get("SettingPage.Check").subscribe(resp=>checkTxt=resp);
    let errorTxt='';
    this.translate.get("Error.IncorrectCode").subscribe(resp=>errorTxt=resp);

    const alert = await this.alertController.create({
      header: headerTxt,
      backdropDismiss: false,
      inputs: [
        {
          name: 'otp',
          type: 'text',
          placeholder: placeholderTxt,
        }
      ],
      buttons: [
        {
          text: cancelTxt,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        },{
          text: checkTxt,
          handler: (res) => {
            const credential = firebase.default.auth.PhoneAuthProvider.credential(this.confirmationResult.verificationId,res.otp);
            firebase.default.auth().currentUser.linkWithCredential(credential).then(res=>{
              this.connectedAccount=true;
            }).catch(err=>{
              this.loadingService.dismiss();
              this.presentToast(errorTxt);
              this.presentAlert();
            })
          }
        }
      ]
    });
    await alert.present();
  }

}
