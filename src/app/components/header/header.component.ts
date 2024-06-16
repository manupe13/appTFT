import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  loggedUserId: string = 'null';
  userRol: string = 'null';

  constructor(private navCtl: Router, public userService: UserService, private globalData: GlobalDataService) { }

  ngOnInit(): void {
    this.globalData.getLoggedUserId().subscribe(id => {
      this.loggedUserId = id;
    });
    this.globalData.getLoggedInUserRol().subscribe(rol => {
      this.userRol = rol;
    });
  }

  goAccount() {
    const navExtras: NavigationExtras = {
      queryParams: {
        userId: this.loggedUserId
      }
    };
    this.navCtl.navigate(['account'], navExtras);
  }

  authorizedRol() {
    if((this.userRol == 'Admin') && this.loggedUserId != 'null') {
      return true;
    } else {
      return false;
    }
  }

}
