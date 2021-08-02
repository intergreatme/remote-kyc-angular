import { Component, OnInit } from '@angular/core';
import { IgmService } from '../_services/igm.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // shortlist = "60c329234895d";
  constructor() { }

  ngOnInit(): void {
    // this.igmService.getAllowlistDetails(this.shortlist).subscribe(a => console.log(a));
  }

}
