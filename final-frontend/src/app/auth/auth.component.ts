import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PatternValidator } from '@angular/forms';
import { ProfileService } from '../profile/profile.service';
import { ProfileClass } from '../profile/ProfileClass';
import { BackendURL } from '../const'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent implements OnInit {
  profile: ProfileClass
  _pswc: string = "";
  dobAlert: string = "";
  pswAlert: string = "";
  regAlert: string = "";

  _logname: string = "";
  _logpsw: string = "";
  logAlert: string = "";

  constructor(private router: Router,
    private profileServ: ProfileService) { }

  ngOnInit() {
    this.profile = new ProfileClass;
  }

  //validate form. Decide whether to register.
  validateRegForm(form: NgForm) {
    var valid = true;

    //validate password
    if (this.profile.psw !== this._pswc) {
      this.pswAlert = "Password does not match.";
      valid = false;
    } else {
      this.pswAlert = "";
    }

    //Age Check: age under 18 invalid
    if (this.profileServ.agecheck(this.profile.dob)) {
      this.dobAlert = "Underage attempt!";
      valid = false;
    } else {
      this.dobAlert = "";
    }

    //if validation does not pass, do not navigate
    if (!valid || !form.valid) {
      this.regAlert = "You are not validated. Please register again."
      return;
    }
    this.regSucceed();
  }

  //send validated form to register
  regSucceed(): void {
    //update profile
    this.profileServ.register(this.profile).subscribe(res => {
      if (res) {
        this.profile = new ProfileClass;
        this._pswc = "";
        this.regAlert = "You are registered. Please log in."
      }
    }, err => {
      this.regAlert = err._body
    });
  }

  //validate login information
  validateLogForm(form: NgForm) {
    this.regAlert = "";
    this.profileServ.login(this._logname, this._logpsw)
      .subscribe(res => {
        if (res) {
          this.onSubmit(form);
          this.logAlert = "";
          this.profile = this.profileServ.getProfile()
        }
      }, err => {
        this.logAlert = "invalid username or password";
      })
  }

  //if form passes angular validation check, navigate to main
  onSubmit(form: NgForm) {
    if (form.valid)
      this.router.navigate(['/main']);
  }

  //browser redirect to facebook login url
  facebookLogin(): void {
    this.profileServ.setLoggedIn();
    window.location.href = `${BackendURL}/auth/facebook`;
  }

}
