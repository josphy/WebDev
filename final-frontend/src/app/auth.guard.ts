import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ProfileService } from './profile/profile.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private profileServ: ProfileService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.profileServ.getLoggedIn())
      return true;
    else {
      this.router.navigate(['/auth']);
      return false;
    }
  }
}
