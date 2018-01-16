import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map'

import { ProfileClass } from './ProfileClass'
import { BackendURL, options } from '../const'

@Injectable()
export class ProfileService {
  currProfile: ProfileClass
  isLoggedIn: boolean

  private uploadHeaders = new Headers();
  private uploadOptions = { headers: this.uploadHeaders, withCredentials: true };

  constructor(private http: Http) {
    this.currProfile = new ProfileClass
    this.isLoggedIn = false;
  }

  //get log in status
  getLoggedIn(): boolean {
    return this.isLoggedIn
  }

  //log out
  logout(): void {
    this.isLoggedIn = false;
    this.http.put(`${BackendURL}/logout`, {}, options)
      .subscribe(res => { console.log('log out: ' + res) }, err => { console.log(err) });
  }

  //set logged in to true
  setLoggedIn(): void {
    this.isLoggedIn = true;
  }

  //getter of profile
  getProfile(): ProfileClass {
    return this.currProfile;
  }

  //modify logged in profile
  modifyProfile(profile): void {
    this.currProfile = profile;
  }

  //post to backend to unlink facebook auth
  facebookUnlink() {
    this.http.post(`${BackendURL}/unlink`, { company: "facebook" }, options)
      .subscribe(res => { console.log(res) }, err => { console.log(err) });
  }

  //post to backend to link local account
  localLink(username, password) {
    this.http.post(`${BackendURL}/merge`, { username, password }, options)
      .subscribe(res => { console.log(res) }, err => { console.log(err) });
  }

  //can update field: email, zipcode, password
  updateProfile(item: string, content: string): void {
    switch (item) {
      case "name":
        break;
      case "mail":
        this.http.put(`${BackendURL}/email`, {
          email: content
        }, options).subscribe(res => {
          console.log("updated email: " + res.json().email)
        }, err => { console.log(err) });
        break;
      case "phone":
        break;
      case "zipcode":
        this.http.put(`${BackendURL}/zipcode`, {
          zipcode: content
        }, options).subscribe(res => {
          console.log("updated zipcode: " + res.json().zipcode)
        }, err => { console.log(err) });
        break;
      case "psw":
        this.http.put(`${BackendURL}/password`, {
          password: content
        }, options).subscribe(res => {
          console.log("updated password: " + res.json().status)
        }, err => { console.log(err) });
        break;
      default:
        console.log("no handler")
    }
  }

  //upload avatar image
  updateAvatar(file): void {
    let data = new FormData();
    data.append('image', file);

    this.http.put(`${BackendURL}/avatar`, data, this.uploadOptions).subscribe(res => {
      this.currProfile.img = res.json().avatar;
    }, err => {
      console.log(err)
    })
  }

  //update status
  updateStatus(newStatus): void {
    this.http.put(`${BackendURL}/headline`, {
      headline: newStatus
    }, options).subscribe(res => {
      console.log("updated headline: " + res.json().headline)
      this.currProfile.headline = newStatus;
    }, err => { console.log(err) });
  }

  //add new registered user
  register(profile) {
    return this.http.post(`${BackendURL}/register`, {
      username: profile.name,
      email: profile.mail,
      dob: profile.dob,
      zipcode: profile.zipcode,
      password: profile.psw
    }).map(response => {
      if (response.json().result === 'success') {
        return true
      }
    }, error => { return false })
  }

  //verify log in status
  //if user does not login, data does not need to be stored
  login(name, psw) {
    return this.http.post(`${BackendURL}/login`, {
      username: name,
      password: psw
    }, options).map(response => {
      //successful login: save profile in service
      if (response.json().result === 'success') {
        this.setLoggedIn();
        return this.initProfile();
      } else {
        return false
      }
    });
  }

  //initial fetch of profile from backend
  initProfile() {
    return this.http.get(`${BackendURL}/email`, options)
      .map(email => {
        this.currProfile.name = email.json().username;
        this.currProfile.mail = email.json().email;
        this.http.get(`${BackendURL}/avatars`, options)
          .subscribe(img => {
            this.currProfile.img = img.json().avatars[0].avatar;
            this.http.get(`${BackendURL}/headlines`, options)
              .subscribe(headlines => {
                this.currProfile.headline = headlines.json().headlines[0].headline;
                this.http.get(`${BackendURL}/dob`, options)
                  .subscribe(dob => {
                    var milliseconds = dob.json().dob;
                    var d = new Date(parseInt(milliseconds));
                    this.currProfile.dob = d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate();
                    this.http.get(`${BackendURL}/zipcode`, options)
                      .subscribe(zipcode => {
                        this.currProfile.zipcode = zipcode.json().zipcode;
                        this.currProfile.psw = "**********";
                        this.setLoggedIn();
                        return true
                      });
                  });
              });
          });
      }, err => { console.log(err) });
  }

  //age check: if under 18, return true
  agecheck(date): boolean {
    var msDOB = new Date(date);
    var diff = Date.now() - msDOB.getTime();
    if (diff / (1000 * 3600 * 24 * 365) < 18) {
      return true;
    } else {
      return false;
    }
  }

  //validation for update profile page
  validateUpdate(profile) {
    var warning = "Invalid Update: " + "\n";
    var valid = true;

    //validate input and record warning message
    if (profile.name != '') {
      var namepattern = /^[a-zA-Z][a-zA-Z0-9]+$/;
      if (!namepattern.test(profile.name)) {
        warning += "Wrong name format: only upper or lower case letters and numbers, but may not start with a number.\n";
        valid = false;
      }
    }
    if (profile.mail != '') {
      var mailpattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!mailpattern.test(profile.mail)) {
        warning += "Wrong email format.\n";
        valid = false;
      }
    }
    if (profile.phone != '') {
      var phonepattern = /^\d{3}-\d{3}-\d{4}$/;
      if (!phonepattern.test(profile.phone)) {
        warning += "Wrong phone number format.\n";
        valid = false;
      }
    }
    if (profile.zipcode != '') {
      var zipcodepattern = /^[0-9]{5}$/;
      if (!zipcodepattern.test(profile.zipcode)) {
        warning += "Wrong zipcode format.\n";
        valid = false;
      }
    }

    return { valid, warning };
  }

}
