import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DocumentStatusEnum } from '../_models/document-status.enum';
import { Eligible } from '../_models/eligible.model';
import { ProfileResponse } from '../_models/profile-response.model';
import { ResponseWrapperCodeEnum } from '../_models/response-wrapper-code.enum';
import { ResponseWrapper } from '../_models/response-wrapper.model';
import { CookieService } from '../_services/cookie.service';
import { IgmService } from '../_services/igm.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  response = ResponseWrapperCodeEnum;
  // userEligible$: BehaviorSubject<Eligible>;
  authToken: string;
  completeState: string;
  eligible: boolean;
  shareID: string;

  documentStatus = DocumentStatusEnum;
  idDocumentStatus: string;
  livelinessStatus: string;
  porStatus: string;

  //Hardcoded info
  shortlist = "-";
  originTxID = environment.originID;
  txID = environment.txID;

  url = 'http://localhost:4205/?whitelistId=' + environment.txID + '&originTxId=' + environment.originID;


  constructor(
    private igmService: IgmService,
    private cookieService: CookieService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.doCheck();
    this.loopFetchProfile();
    this.doEligibilityCheck();
  }

  loopFetchProfile() {
    setTimeout(() => {
      console.log("Fetch profile");
      this.doCheck();
      this.loopFetchProfile();
    }, 15000);
  }

  doCheck() {
    //Check if Eligibility has already been done - IF so, then dont call eligible check again and only get profile.
    //Check if authcookie exists, if not do the eligibile check.
    var authToken = this.cookieService.getCookie("kyc-auth");
    if (authToken != null) {
      console.log("Auth cookie exists, therefor only Get profile is called.");
      this.getProfile();
    } else {
      console.log("No auth cookie exists, therefor doing Eligibility check.");
      this.doEligibilityCheck();
    }
  }

  getProfile() {
    console.log("Getting profile");
    this.igmService.getProfile()
      .pipe().subscribe((wrappedResponse: ResponseWrapper<ProfileResponse>) => {
        const code = wrappedResponse.code;
        if (code != ResponseWrapperCodeEnum.OK) {
          console.log("Retrieving the user profile failed: " + code);
         } else {
          console.log("Response OK, continue processing response");
          const response = wrappedResponse.data;
          let profileData = {
            id: response['id'],
            origin_tx_id: response['origin_tx_id'],
            unique_field: response['unique_field'],
            document_number: response['document_number'],
            passport_country: response['passport_country'],
            use_passport: response['use_passport'],
            first_name: response['first_name'],
            last_name: response['last_name'],
            email_address: response['email_address'],
            documents: response['documents'],
            share_status: response['share_status'],
            share_success: response['share_success'],
            liveliness_state: response['liveliness_state'],
            address: response['address'],
          }
          console.log(profileData);

          if (profileData.documents != null) {
            for (let i = 0; i <= profileData.documents.length - 1; i++) {
              if (!profileData.documents[i].doc_type || !profileData.documents[i].status) {
                console.log("There is NO document for [" + i + "]");
                continue;
              }
              console.log("There is a document for [" + i + "]");
              switch (profileData.documents[i].doc_type) {
                case 'ID_CARD': // fallthrough
                case 'ID_BOOK': // fallthrough
                case 'RSA_PASSPORT':
                  console.log("ID document state: " + profileData.documents[i].status);
                  this.idDocumentStatus = profileData.documents[i].status;
                  break;
                case 'PROOF_OF_RESIDENCE':
                  console.log("Proof of residence state: " + profileData.documents[i].status);
                  this.porStatus = profileData.documents[i].status;
                  break;
                default:
                  console.log("Document type not found: " + profileData.documents[i].doc_type);
                  break;
              }
            }
          } else {
            this.idDocumentStatus = null;
            this.porStatus = null;
          }

          if (profileData.liveliness_state) {
            console.log('livelines state: ' + profileData.liveliness_state);
            this.livelinessStatus = profileData.liveliness_state;
          } else {
            this.livelinessStatus = null;
          }

          if (profileData.share_success == false) {
            this.router.navigate(['error'])
          }

          if (this.livelinessStatus === 'PASS'
          && (this.idDocumentStatus === 'VERIFIED' || this.idDocumentStatus === 'VALID')
          && this.porStatus === 'VALID') {
            console.log('Transaction completed');
            this.router.navigate(['success']);
          }
        }
      });
  }


  doEligibilityCheck() {
    if (!this.txID) {
      console.log("No Tx ID found.");
    }
    if (!this.originTxID) {
      console.log("No Origin Tx ID found.");
    }

    console.log("Doing Eligibility check on TX: " + this.txID + " and  Origin TX" + this.originTxID);

    this.igmService.checkEligibility(this.txID, this.originTxID)
      .pipe().subscribe((wrappedResponse: ResponseWrapper<Eligible>) => {
        const code = wrappedResponse.code;
        console.log("Returned response code: " + code);
        if (code != ResponseWrapperCodeEnum.OK) {
          console.log("Eligibility check failed: " + code);
        } else {
          console.log("Response OK, continue processing response");
          const response = wrappedResponse.data;

          let data = {
            eligible: response['eligible'],
            shareID: response['share_id'],
            completeState: response['complete_state'],
            authToken: response['auth_token'],
          };

          console.log(data);

          if (data.completeState == "INCOMPLETE") {
            console.log("CompleteState is: " + data.completeState);
            this.getProfile()
          }

          if (data.completeState == "COMPLETE") {
            console.log("CompleteState is: " + data.completeState);
            this.router.navigate(['end']);
          }

          if (data.completeState == "TIMEOUT") {
            console.log("CompleteState is: " + data.completeState);
            this.router.navigate(['timeout']);
          }
        }
      });
  }

  routeToID() {
    this.router.navigate(["id-documentation"]);
  }

  routeToPor() {
    this.router.navigate(["proof-of-residence"]);
  }

  routeToLiveliness() {
    window.location.href = this.url;
  }

  // getInfo() {
  //   var configID = environment.configId;
  //   var shareID = environment.txID;
  //   this.igmService.getInfo(configID, shareID).pipe().subscribe(a =>
  //     console.log(a)
  //   )
  // }
}
