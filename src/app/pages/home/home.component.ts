import { Component, OnInit } from '@angular/core';
import { GlobalDataService } from 'src/app/services/global-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loggedUserId: string = 'null';

  constructor(private globalData: GlobalDataService) { }

  ngOnInit(): void {
    this.globalData.getLoggedUserId().subscribe(id => {
      this.loggedUserId = id;
    });
  }

}
