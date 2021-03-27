import { NoLoginGuard } from './guards/no-login.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule),
    //canActivate:[NoLoginGuard]
  },
  {
    path: 'chat',
    loadChildren:()=>import('./chat/chat.module').then(m=>m.ChatModule),
    //canActivate:[AuthGuard]
  },
  {
    path:'**',
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
