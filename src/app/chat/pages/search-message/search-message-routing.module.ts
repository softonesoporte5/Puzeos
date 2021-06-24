import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchMessagePage } from './search-message.page';

const routes: Routes = [
  {
    path: '',
    component: SearchMessagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchMessagePageRoutingModule {}
