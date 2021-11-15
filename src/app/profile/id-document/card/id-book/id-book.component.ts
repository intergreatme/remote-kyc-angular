import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { DocumentFileTypeEnum } from 'src/app/_models/document-file-type.enum';
import { DocumentTypeEnum } from 'src/app/_models/document-type.enum';
import { ProfileResponse } from 'src/app/_models/profile-response.model';
import { ResponseWrapperCodeEnum } from 'src/app/_models/response-wrapper-code.enum';
import { ResponseWrapper } from 'src/app/_models/response-wrapper.model';
import { UploadProgressModel } from 'src/app/_models/upload-progress.model';
import { CookieService } from 'src/app/_services/cookie.service';
import { IgmService } from 'src/app/_services/igm.service';
import { UploadService } from 'src/app/_services/upload.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-id-book',
  templateUrl: './id-book.component.html',
  styleUrls: ['./id-book.component.css']
})
export class IdBookComponent implements OnInit, OnDestroy {
  selfie: any;
  inside: any;
  idDocumentStatus: any;
  fileType: string;
  txID: string;
  selfieSub: Subscription;
  insideSub: Subscription;

  rejectMessageFront = { body: '', id: '', title: '' };
  rejectMessageSelfie = { body: '', id: '', title: '' };
  documentRejected = false;
  
  uploadResponse: any;
  uploadingSelfie = false;
  currentPercentageSelfie = 0;
  uploadingInside = false;
  currentPercentageInside = 0;

  constructor(
    private igmService: IgmService,
    private router: Router,
    private uploadService: UploadService,
  ) { }

  ngOnInit(): void {
    if (this.selfie != null) {
      this.getPreviewForSelfie();
    }
    this.getProfile();
  }

  uploadFileForSelfie(event) {
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;
    const progress = new Subject<UploadProgressModel>();
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.ID_BOOK, DocumentFileTypeEnum.SELFIE, file)
        .pipe().subscribe(
          event => {
            if (event == null) {
              return;
            }
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadingSelfie = true;
              this.currentPercentageSelfie = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              const response: ResponseWrapper<any> = event.body;
              const responseCode = response.code;
              switch (responseCode) {
                case ResponseWrapperCodeEnum.OK:
                  // Close the progress-stream if we get an answer form the API
                  // The upload is complete
                  progress.next({ percentDone: 100, success: true });
                  progress.complete();
                  this.getPreviewForSelfie();
                  break;
                case ResponseWrapperCodeEnum.UNEXPECTED_ERROR:
                case ResponseWrapperCodeEnum.UPLOAD_FAILED:
                default:
                  alert(
                    'Please check your connection and try again. If this error persists please try a different browser/device.',
                  );
                  progress.next({ percentDone: this.currentPercentageSelfie, error: true });
                  progress.complete();
                  break;
              }
            }
          }
        )
    }
  }

  getPreviewForSelfie() {
    this.selfieSub = new Observable<string>(observer => {
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        observer.next(reader.result.toString());
        observer.complete();
      }, false);

      this.igmService.getPreview(DocumentTypeEnum.ID_BOOK, DocumentFileTypeEnum.SELFIE, 50).subscribe(blob => {
        console.log(blob);

        if (blob) {
          reader.readAsDataURL(blob);
        }
      }, error => {
        console.log('Failed to get inside preview of ID-Book : ' + error.message);
      });
    }).subscribe((result) => {
      this.uploadingSelfie = false;
      this.selfie = result;
    });
  }


  uploadFileForInside(event) {
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;
    const progress = new Subject<UploadProgressModel>();
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.ID_BOOK, DocumentFileTypeEnum.FRONT, file).pipe().subscribe(
        event => {
          if (event == null) {
            return;
          }
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadingInside = true;
            this.currentPercentageInside = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            const response: ResponseWrapper<any> = event.body;
            const responseCode = response.code;
            switch (responseCode) {
              case ResponseWrapperCodeEnum.OK:
                // Close the progress-stream if we get an answer form the API
                // The upload is complete
                progress.next({ percentDone: 100, success: true });
                progress.complete();
                this.getPreviewForInside();
                break;
              case ResponseWrapperCodeEnum.UNEXPECTED_ERROR:
              case ResponseWrapperCodeEnum.UPLOAD_FAILED:
              default:
                alert(
                  'Please check your connection and try again. If this error persists please try a different browser/device.',
                );
                progress.next({ percentDone: this.currentPercentageInside, error: true });
                progress.complete();
                break;
            }
          }
        }
      )
    }
  }


  getPreviewForInside() {
    this.insideSub = new Observable<string>(observer => {
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        observer.next(reader.result.toString());
        observer.complete();
      }, false);

      this.igmService.getPreview(DocumentTypeEnum.ID_BOOK, DocumentFileTypeEnum.FRONT, 50).subscribe(blob => {
        if (blob) {
          reader.readAsDataURL(blob);
        }
      }, error => {
        console.log('Failed to get inside preview of ID-Book : ' + error.message);
      });
    }).subscribe((result) => {
      this.uploadingInside = false;
      this.inside = result;
    });
  }

  onContinue() {
    console.log("Validating file" + DocumentTypeEnum.ID_BOOK);
    this.igmService.requestValidation(DocumentTypeEnum.ID_BOOK).subscribe(a => {
      console.log("Validation has been requested");
      this.router.navigate(['/']);
    }
    )
  }

  ngOnDestroy(): void {
    if (this.selfieSub) {
      this.selfieSub.unsubscribe();
    }
    if (this.insideSub) {
      this.insideSub.unsubscribe();
    }
  }

  chooseDifferentDoc() {
    this.router.navigate(['id-documentation']);
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
                    this.documentRejected = true;

                    this.rejectMessageSelfie = profileData.documents[i].files[0].message;
                    this.rejectMessageFront = profileData.documents[i].files[1].message;

                    console.log(this.rejectMessageFront);
                    console.log(this.rejectMessageSelfie);


                    if (this.rejectMessageSelfie != null) {
                      this.rejectMessageSelfie.body = profileData.documents[i].files[0].message.body;
                      this.rejectMessageSelfie.id = profileData.documents[i].files[0].message.id;
                      this.rejectMessageSelfie.title = profileData.documents[i].files[0].message.title;
                    }

                    if (this.rejectMessageFront) {
                      this.rejectMessageFront.body = profileData.documents[i].files[1].message.body;
                      this.rejectMessageFront.id = profileData.documents[i].files[1].message.id;
                      this.rejectMessageFront.title = profileData.documents[i].files[1].message.title;
                    }
                  } else {
                    console.log(profileData.documents[i].doc_type + " is not in a reject state.");
                  }
                  break;
                case 'ID_CARD':
                case 'RSA_PASSPORT':
                case 'PROOF_OF_RESIDENCE':
                default:
                  break;
              }
            }
          }
        }
      })
  }
}
