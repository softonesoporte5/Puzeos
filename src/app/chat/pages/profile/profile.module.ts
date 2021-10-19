import { TopicsModalComponent } from './../../../components/topics-modal/topics-modal.component';
import { SharedModule } from './../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [
    ProfilePage,
    TopicsModalComponent
  ]
})
export class ProfilePageModule {}
