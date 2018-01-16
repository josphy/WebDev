import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { FollowingClass } from './FollowingClass'
import { BackendURL, options } from '../const'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FollowingsService {
  followings: FollowingClass[];
  total: number;

  constructor(private http: Http) {
    this.followings = [];
  }

  //initialize read json request
  initFollowings() {
    return this.http.get(`${BackendURL}/following`, options)
      .map(res1 => {
        var ids = res1.json().following;
        if (ids.length == 0) return;
        this.followings = new Array(ids.length).fill(null).map(v => new FollowingClass);
        ids.map((id, idx) => {
          this.followings[idx].id = id;
        })

        this.http.get(`${BackendURL}/headlines/${ids.concat()}`, options)
          .subscribe(res2 => {
            var headlines = res2.json().headlines;
            headlines.map((headline, idx) => {
              this.followings[idx].name = headline.username;
              this.followings[idx].headline = headline.headline;
            })
          }, err2 => { console.log(err2) });

        this.http.get(`${BackendURL}/avatars/${ids.concat()}`, options)
          .subscribe(res3 => {
            var avatars = res3.json().avatars;
            avatars.map((avatar, idx) => {
              this.followings[idx].img = avatar.avatar;
            })
          }, err3 => { console.log(err3) });

        return true;

      }, err1 => {
        console.log(err1);
        return false;
      });
  }

  //getter of followings
  getFollowings(): FollowingClass[] {
    return this.followings;
  }

  //add new following to list
  addFollowing(newId: string) {
    return this.http.put(`${BackendURL}/following/${newId}`, {}, options)
      .map(res => {
        var newFollow = new FollowingClass;
        newFollow.id = newId;

        this.http.get(`${BackendURL}/headlines/${newId}`, options)
          .subscribe(res2 => {
            var headline = res2.json().headlines[0];
            newFollow.name = headline.username;
            newFollow.headline = headline.headline;
          }, err2 => { console.log(err2) });

        this.http.get(`${BackendURL}/avatars/${newId}`, options)
          .subscribe(res3 => {
            var avatar = res3.json().avatars[0];
            newFollow.img = avatar.avatar;
          }, err3 => { console.log(err3) });

        this.followings.push(newFollow);
        return true;

      }, err => {
        console.log(err);
        return false;
      });

  }

  //remove following from list
  unfollow(id) {
    return this.http.delete(`${BackendURL}/following/${id}`, options)
      .map(res => {
        this.followings = this.followings.filter(function(following) {
          return following.id !== id;
        });
      }, err => { console.log(err) });
  }

}
