import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  hasUpdate = false;

  // user: UserPrincipal;

  constructor(){}
    // private swUpdate: SwUpdate) {
    // check for platform update
    // if (this.swUpdate.isEnabled) {
    //   interval(60000).subscribe(() => this.swUpdate.checkForUpdate().then(() => {
    //     // checking for updates
    //   }));
    // }
    // this.swUpdate.available.subscribe(() => {
    //   this.hasUpdate = true;
    // });
  // }
  ////

  // reloadSite(): void {
  //   window.location.reload();
  // }
}


