import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SavedMessagesPageRoutingModule } from './saved-messages-routing.module';

import { SavedMessagesPage } from './saved-messages.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SavedMessagesPageRoutingModule
  ],
  declarations: [SavedMessagesPage]
})
export class SavedMessagesPageModule {}
