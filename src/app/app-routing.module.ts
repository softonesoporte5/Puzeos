import { AuthenticationGuard } from './guards/authentication.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule),
    data:{
      module:"auth"
    },
    canActivate:[AuthenticationGuard]
  },
  {
    path: 'chat',
    loadChildren:()=>import('./chat/chat.module').then(m=>m.ChatModule),
    data:{
      module:"chat"
    },
    canActivate:[AuthenticationGuard]
  },
  {
    path:'',
    pathMatch:'full',
    redirectTo:'chat'
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
