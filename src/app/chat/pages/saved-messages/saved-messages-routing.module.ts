import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SavedMessagesPage } from './saved-messages.page';

const routes: Routes = [
  {
    path: '',
    component: SavedMessagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SavedMessagesPageRoutingModule {}
