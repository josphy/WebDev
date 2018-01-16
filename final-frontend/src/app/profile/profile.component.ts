import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';
import { ProfileClass } from './ProfileClass';
import { BackendURL } from '../const'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: ProfileClass;
  newProfile: ProfileClass;
  isLocalAccount: Boolean;
  isThirdParty: Boolean;
  _pswc: string = "";
  info: string = "";

  constructor(private router: Router, private profileServ: ProfileService) { }

  ngOnInit() {
    this.getProfile();
    this.newProfile = new ProfileClass;
    this.isThirdParty = Boolean(this.profile.name.split('@')[1]);
    this.isLocalAccount = !this.isThirdParty;
  }

  //get profile of logged in user
  getProfile(): void {
    this.profile = this.profileServ.getProfile();;
  }

  //link local account with facebook account
  facebookLink() {
    window.location.href = `${BackendURL}/link/facebook`;
  }

  //unlink local account from facebook auth
  facebookUnlink() {
    this.profileServ.facebookUnlink();
  }

  //link facebook account to local
  localLink(username, password) {
    this.profileServ.localLink(username, password);
  }

  //update validation
  validateUpdate(): void {
    var response = this.profileServ.validateUpdate(this.newProfile);
    var valid = response.valid;
    var warning = response.warning;

    if (this.newProfile.psw != this._pswc) {
      warning += "Password does not match.\n";
      valid = false;
    }

    //if not valid, does not update display
    if (!valid) {
      this.info = warning;
      return;
    }
    this.updateSucceed();
  }

  //update validated operations: display tips
  updateSucceed(): void {
    var inputfield = ["name", "mail", "phone", "zipcode", "psw"];
    var record = "Updated Field: ";
    var updated = false;
    inputfield.forEach((input) => {
      if (this.newProfile[input] != "") {
        if (this.newProfile[input] !== this.profile[input]) {
          updated = true;
          record += '\n' + input + ": " + this.profile[input] + " -> " + this.newProfile[input];
          this.profile[input] = this.newProfile[input];
          this.profileServ.updateProfile(input, this.newProfile[input]);
        }
        this.newProfile[input] = "";
      }
    });
    this.profile.psw = "**********";
    this._pswc = "";

    //display updated information
    if (updated) {
      this.info = record;
      this.profileServ.modifyProfile(this.profile);
    }
    else {
      this.info = "";
    }
  }

  //upload avatar
  updateAvatar(e): void {
    let fileList = e.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      this.profileServ.updateAvatar(file);
    }
  }
}
