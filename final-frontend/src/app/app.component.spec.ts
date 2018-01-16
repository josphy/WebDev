import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component'
import { AuthComponent } from './auth/auth.component'
import { ProfileComponent} from './profile/profile.component'

import { HttpModule }  from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing'
import { Router} from "@angular/router";
import { appRoutes} from './app.module'
import { Location} from "@angular/common";
import { FormsModule } from '@angular/forms'
import { MatToolbarModule } from '@angular/material';
import { MatCardModule } from '@angular/material';

import { ArticlesService } from './article/articles.service'
import { FollowingsService } from './main/followings.service'
import { ProfileService } from './profile/profile.service'

// import fetch, { mock } from 'mock-fetch';
// import { url, resource } from './profileActions';
import { navigateToMain, navigateToProfile, navigateToAuth } from './profileActions';
import { url, resource, mock, fetch } from './resource'

const mockery = require('mockery');
const fetchMock = require('fetch-mock');

describe('Validate actions (these are functions that dispatch actions)', () => {

  let location: Location;
  let router: Router;
  let fixture;

  beforeEach(async(() => {

    if (mockery.enable) {
       mockery.enable({warnOnUnregistered: false});
       mockery.registerMock('node-fetch', fetch);
       require('node-fetch');
    }

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MainComponent,
        AuthComponent,
        ProfileComponent,
      ],
      imports: [
        HttpModule,
        RouterTestingModule.withRoutes(appRoutes),
        MatToolbarModule,
        MatCardModule,
        FormsModule
      ],
      providers: [
        ArticlesService,
        FollowingsService,
        ProfileService
      ]
    }).compileComponents();

    router = TestBed.get(Router);
    location = TestBed.get(Location);

    fixture = TestBed.createComponent(AppComponent);
    router.initialNavigation();
  }));

  afterEach(() => {
         if (mockery.enable) {
           mockery.deregisterMock('node-fetch');
           mockery.disable();
         }

         // Unmock.
         fetchMock.restore();
     });

  // resource should be a resource (i.e., mock a request)
  it(`resource should be a resource (i.e., mock a request)`, async(() => {
    const username = 'hz56';
    const password = 'fine-thank-you';

    mock(`${url}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      json: {username, password, result:"success"}
    });

    resource('POST', 'login', {username,password})
      .then((response) => {
			     expect(response.result).toEqual("success")
		  });

  }));

  // resource should give me the http error
  it(`resource should give me the http error`, async(() => {
    const username = 'hz56';
    const password = 'fine-thank-you';

    mock(`${url}/login`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      json: {error: "Http Error"}
    });

    resource('DELETE', 'login', {username, password})
		  .then(err => {
        expect(err.error).toEqual('Http Error')
      });
  }));

  // resource should be POSTable
  it(`resource should be POSTable`, async(() => {
    const username = 'hz56';
    const password = 'fine-thank-you';

    mock(`${url}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      json: {username, password, result:'success'}
    });

    resource('POST', 'login', {username, password})
      .then((response) => {
			     expect(response.result).toEqual("success")
		  });
  }));

  // should update error message (for displaying error mesage to user)
  it(`should update error message (for displaying error mesage to user)`, async(() => {
    const username = 'hz56';
    const password = 'wrong-password';

    mock(`${url}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      json: {username, password, error:'error input'}
    });

    resource('POST', 'login', {username, password})
		  .then(response => {
			     expect(response.error).toEqual('error input');
      });
    }));

  // should update success message (for displaying success message to user)
  it(`should update success message (for displaying success message to user)`, async(() => {
    const username = 'hz56';
    const password = 'fine-thank-you';

    mock(`${url}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      json: {username, password, result:'success'}
    });

    resource('POST', 'login', {username, password})
      .then((response) => {
			     expect(response.result).toEqual("success")
		  });
  }));

  // should navigate (to profile, main, or landing)
  it(`should navigate (to profile, main, or landing))`, async(() => {
    // router.navigate(['']); expect(location.path()).toBe('/auth');
    expect(navigateToMain()).toEqual('main');
    expect(navigateToAuth()).toEqual('auth');
    expect(navigateToProfile()).toEqual('profile');
  }));

});
