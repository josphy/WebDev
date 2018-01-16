import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material';
import { MatCardModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthComponent } from './auth/auth.component';

import { ArticlesService } from './article/articles.service'
import { FollowingsService } from './main/followings.service'
import { ProfileService } from './profile/profile.service'
import { AuthGuard } from './auth.guard'

//use router to id
export const appRoutes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'main', component: MainComponent },
  { path: 'profile', canActivate: [AuthGuard], component: ProfileComponent },
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ProfileComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    MatToolbarModule,
    MatCardModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(
      appRoutes,
      { useHash: true }
    )
  ],
  exports: [
    RouterModule,
    MatToolbarModule,
    MatCardModule
  ],
  providers: [
    ArticlesService,
    FollowingsService,
    ProfileService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
