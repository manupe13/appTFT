import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {

  private _loggedUserId = new BehaviorSubject<string>('null');
  private _loggedInUserRol = new BehaviorSubject<string>('null');
  private _authorizedRol = new BehaviorSubject<boolean>(false);

  constructor() { }

  getLoggedUserId(): Observable<string> {
    return this._loggedUserId.asObservable();
  }

  setLoggedUserId(value: string) {
    this._loggedUserId.next(value);
  }

  getLoggedInUserRol(): Observable<string> {
    return this._loggedInUserRol.asObservable();
  }

  setLoggedInUserRol(value: string) {
    this._loggedInUserRol.next(value);
    let userId = 'null';
    this.getLoggedUserId().subscribe(id => {
      userId = id;
    });
    if((value == 'Admin') && userId != 'null') {
      this._authorizedRol.next(true);
    } else {
      this._authorizedRol.next(false);
    }
  }

  authorizedRol() {
    return this._authorizedRol.asObservable();
  }

}
