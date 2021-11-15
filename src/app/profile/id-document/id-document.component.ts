import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileResponse } from 'src/app/_models/profile-response.model';
import { ResponseWrapperCodeEnum } from 'src/app/_models/response-wrapper-code.enum';
import { ResponseWrapper } from 'src/app/_models/response-wrapper.model';
import { IgmService } from 'src/app/_services/igm.service';

@Component({
  selector: 'app-id-document',
  templateUrl: './id-document.component.html',
  styleUrls: ['./id-document.component.css']
})
export class IDDocumentComponent implements OnInit {
  idCardRejected = false;
  idBookRejected = false;

  constructor(private router: Router, private igmService: IgmService) { }

  ngOnInit(): void {
    this.getProfile();
  }

  onBack() {
    //Route back to the Profile component
    this.router.navigate(["/"])
  }

  routeToIdBook() {
    this.router.navigate(["id-documentation/id-book"]);
  }

  routeToIdCard() {
    this.router.navigate(["id-documentation/id-card"]);
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
                case 'ID_BOOK':
                  if (profileData.documents[i].status == 'VALIDATION_FAILED' || profileData.documents[i].status == 'VERIFICATION_FAILED') {
                    this.idBookRejected = true;
                    break;

                  }
                  break;
                case 'ID_CARD':
                  if (profileData.documents[i].status == 'VALIDATION_FAILED' || profileData.documents[i].status == 'VERIFICATION_FAILED') {
                    this.idCardRejected = true;
                    break;
                  }
                  break;
                case 'PROOF_OF_RESIDENCE':
                case 'RSA_PASSPORT':
                default:
                  break;
              }
            }
          }
        }
      })
  }
}
