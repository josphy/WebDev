import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import fetch, { mock } from 'mock-fetch';
import { ProfileComponent } from './profile.component';
import { HttpModule }  from '@angular/http';
import { FormsModule } from '@angular/forms'

import { ProfileService } from './profile.service'
import { logout, getProfile, updateStatus } from '../profileActions';
import { resource, url, mock, fetch } from '../resource';

describe('Validate Profile actions (mocked requests)', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileComponent ],
      imports: [ FormsModule, HttpModule ],
      providers: [
        ProfileService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // should fetch the user's profile information
  it(`should fetch the user's profile information`, async(() => {

    mock(`${url}/profile`, {
           method: 'GET',
           headers: { 'Content-Type': 'application/json' },
           json: {zipcode: "77005"}
        });

    getProfile()
      .then(response => {
        expect(response.zipcode).toEqual('77005');
    });
   }));

  // should update headline
  it(`should update headline`, async(() => {
    const newheadline = 'new headline'

    mock(`${url}/headline`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           json: {headline: newheadline}
        });

    updateStatus(newheadline)
      .then(res => {
        expect(res.headline).toEqual('new headline');
      });
   }));

});
