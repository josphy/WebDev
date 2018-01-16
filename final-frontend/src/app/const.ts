import { Headers } from '@angular/http';

export const BackendURL = 'https://hz56backend.herokuapp.com';

export const options = {
  headers: new Headers({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};
