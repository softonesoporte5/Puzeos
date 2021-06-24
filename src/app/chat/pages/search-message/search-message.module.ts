import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchMessagePageRoutingModule } from './search-message-routing.module';

import { SearchMessagePage } from './search-message.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchMessagePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SearchMessagePage]
})
export class SearchMessagePageModule {}
