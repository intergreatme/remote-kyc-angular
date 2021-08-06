import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Eligible } from '../_models/eligible.model';
import { ResponseWrapperCodeEnum } from '../_models/response-wrapper-code.enum';
import { ResponseWrapper } from '../_models/response-wrapper.model';
import { CookieService } from '../_services/cookie.service';
import { IgmService } from '../_services/igm.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  userEligible$: BehaviorSubject<Eligible>;
  response = ResponseWrapperCodeEnum;
  authToken: string;
  completeState: string;
  eligible: boolean;
  shareID: string;

  //Hardcoded info
  shortlist = "-";
  origingID = environment.originID;
  txID = environment.txID;

  constructor(
              private igmService: IgmService,
              private cookieService: CookieService,
              private router: Router
             ) { }

  ngOnInit(): void {
    this.userEligible$ = new BehaviorSubject<Eligible>(null);

  }

  getInfo() {
    this.igmService.getAllowlistDetails(this.shortlist).subscribe(a => console.log(a));
  }

  doEligibilityCheck(){
    this.igmService.checkEligibility(this.txID, this.origingID)
    .pipe().subscribe((wrappedResponse: ResponseWrapper<Eligible>) => {
      const code = wrappedResponse.code;
      console.log("Returned response code: " + code);
       if(code != ResponseWrapperCodeEnum.OK) {
        console.log("Eligibility check failed: " + code);
      } else {
        console.log("Response OK, continue processing response");
        const response = wrappedResponse.data;

        //Assign the response to local variables.
        let data = {
          eligible: response['eligible'],
          shareID: response['share_id'],
          completeState: response['complete_state'],
          authToken: response['auth_token'],
        };
        //Typical response:
        // Eligible: true
        // Share ID: 86e38a5d-df14-4885-bb4c-9c642ec72a21
        // Complete state: INCOMPLETE
        // Auth Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI4NmUzOGE1ZC1kZjE0LTQ4ODUtYmI0Yy05YzY0MmVjNzJhMjEiLCJhdWQiOiJJR01fS1lDX01PRFVMRSIsIm5iZiI6MTYyMzc1MjcwOCwicm9sZXMiOlsiS1lDX1NIQVJFIl0sImRpc3BsYXkiOiJHZXJ0IFN0ZWVua2FtcCIsImlzcyI6IklOVEVSR1JFQVRNRS1LWUMiLCJzaGFyZSI6Ijg2ZTM4YTVkLWRmMTQtNDg4NS1iYjRjLTljNjQyZWM3MmEyMSIsImV4cCI6MTYyNDM1NzUwOCwiaWF0IjoxNjIzNzUyNzA4LCJjb25maWciOiI0MWQ5ZGI2OC1jZWJmLTQwNDUtYTA1YS02NWY5MWJiYzQwMTAiLCJqdGkiOiI4YzhjOGQ0Mi05YThmLTQ1OTQtODk5NS01ZThjZDVhOTIxMjYifQ.10witNF7AvsPl2FuFAnqtbDES4k_QfUIIMgmRhrqJIw

        this.userEligible$.next(data);
        this.completeState = this.userEligible$.value.completeState;
        this.authToken = this.userEligible$.value.authToken;
        this.eligible = this.userEligible$.value.eligible;
        this.shareID = this.userEligible$.value.shareID;

        console.log("Eligible: " + data.eligible);
        console.log("Share ID: " + data.shareID);
        console.log("Complete state: " + data.completeState);
        console.log("Auth Token: " + data.authToken);

        //TODO Check if eligible is true & share ID is not null. Then continue
        //Check What the complete state is:
        //AWAITING-VERIFICATION  -> Already completed still busy processing.
        //TIMEOUT - Link expired
        //CONSENT & COMPLETE -> Transaction already completed
        //INCOMPLETE, store the authToken as a cookie and start the process.


        //NOTE. THE AUTH_TOKEN is already being set once you call the API as kyc-auth cookie. You do not need to set a cookie yourself.
        //However to get the cookie, use a service written like I did under services/cookie.services.ts.
        var auth = this.cookieService.getCookie("kyc-auth");
        console.log("The kyc-auth cookie token is: " + auth);
      }
    });
  }

  routeMe() {
    this.router.navigate(["profile"]);
  }
}
