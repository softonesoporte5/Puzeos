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
    FormsModule
  ]
})
export class AuthModule { }

