import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes:Routes=[
  {
    path:'**',
    redirectTo:'register'
  },
  {
    path: 'verificar',
    loadChildren: () => import('./pages/verificar/verificar.module').then( m => m.VerificarPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports:[
    RouterModule
  ]
})
export class AuthRoutingModule { }
