import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
// import fetch, { mock } from 'mock-fetch';
import { url, resource, mock, fetch } from '../resource'

import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms'
import { HttpModule }  from '@angular/http';

import { ProfileService } from '../profile/profile.service'
import { login, logout } from '../profileActions';

describe('Validate Authentication (involves mocked requests)', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthComponent ],
      imports: [ FormsModule, RouterTestingModule, HttpModule ],
      providers: [
        ProfileService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // should log in a user
  it('should login in a user', async(()=>{
    const username = 'hz56'
    const password = 'fine-thank-you'

    mock(`${url}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      json: {username, password, result:'success'}
    })

    login(username, password)
      .then(response => {
        expect(response).toEqual('success');
      });
  }))

  // should not log in an invalid user
  it('should not login in an invalid user', async(()=>{
    const username = 'hz56'
    const password = 'wrong-password'

    mock(`${url}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      json: {username, password, result:'invalid'}
    })

    login(username, password)
      .then(response => {
        expect(response).toEqual('invalid')
      });
  }));

  // should log out a user (state should be cleared)
  it(`should out a user (state should be cleared)`, async(() => {

    mock(`${url}/logout`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' }
    });
    logout()
      .then(response => {
        expect(response).toEqual('You have logged out');
    });
   }));

});
