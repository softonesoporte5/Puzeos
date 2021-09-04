import { SharedModule } from './../shared/shared.module';
import { SnackbarModule } from 'ngx-snackbar';
import { IonicModule } from '@ionic/angular';
import { AuthRoutingModule } from './auth-routing.module';
import { RegisterPage } from './pages/register/register.page';
import { LoginPage } from './pages/login/login.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {ExtendedFirebaseUIAuthConfig, firebase, firebaseui, FirebaseUIModule} from 'firebaseui-angular-i18n';

const firebaseUiAuthConfig: ExtendedFirebaseUIAuthConfig = {
  signInFlow: 'redirect',
  signInOptions: [
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  privacyPolicyUrl: 'https://docs.google.com/document/d/1XHJjxROjaA0F-ZO1wfhMDtM6noHxYip2F9bjKsXfFFc/edit?usp=sharing',
  language:'it'
};

@NgModule({
  declarations: [
    RegisterPage,
    LoginPage
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    IonicModule,
    SnackbarModule.forRoot(),
    SharedModule,
    FormsModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
  ]
})
export class AuthModule { }

