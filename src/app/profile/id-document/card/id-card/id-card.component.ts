import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { DocumentFileTypeEnum } from 'src/app/_models/document-file-type.enum';
import { DocumentTypeEnum } from 'src/app/_models/document-type.enum';
import { ResponseWrapperCodeEnum } from 'src/app/_models/response-wrapper-code.enum';
import { ResponseWrapper } from 'src/app/_models/response-wrapper.model';
import { UploadProgressModel } from 'src/app/_models/upload-progress.model';
import { CookieService } from 'src/app/_services/cookie.service';
import { IgmService } from 'src/app/_services/igm.service';
import { UploadService } from 'src/app/_services/upload.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-id-card',
  templateUrl: './id-card.component.html',
  styleUrls: ['./id-card.component.css']
})
export class IdCardComponent implements OnInit, OnDestroy {
  selfie: any;
  frontOfCard: any;
  backOfCard: any;

  fileType: string;
  txID: string;
  selfieSub: Subscription;
  frontSub: Subscription;
  backSub: Subscription;

  uploadResponse: any;
  uploadingSelfie = false;
  currentPercentageSelfie = 0;
  uploadingFront = false;
  currentPercentageFront = 0;
  uploadingBack = false;
  currentPercentageBack = 0;

  constructor(
    private igmService: IgmService,
    private router: Router,
    private uploadService: UploadService,
    ) { }

  ngOnInit(): void {
  }

  uploadFileForSelfie(event) {
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;
    const progress = new Subject<UploadProgressModel>();
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.ID_CARD, DocumentFileTypeEnum.SELFIE, file)
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
      this.igmService.getPreview(DocumentTypeEnum.ID_CARD, DocumentFileTypeEnum.SELFIE, 50).subscribe(blob => {
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


  uploadFileForFrontOfCard(event) {
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;
    const progress = new Subject<UploadProgressModel>();
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.ID_CARD, DocumentFileTypeEnum.FRONT, file)
        .pipe().subscribe(
          event => {
            if (event == null) {
              return;
            }
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadingFront = true;
              this.currentPercentageFront = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              const response: ResponseWrapper<any> = event.body;
              const responseCode = response.code;
              switch (responseCode) {
                case ResponseWrapperCodeEnum.OK:
                  // Close the progress-stream if we get an answer form the API
                  // The upload is complete
                  progress.next({ percentDone: 100, success: true });
                  progress.complete();
                  this.getPreviewForFrontOfCard();
                  break;
                case ResponseWrapperCodeEnum.UNEXPECTED_ERROR:
                case ResponseWrapperCodeEnum.UPLOAD_FAILED:
                default:
                  alert(
                    'Please check your connection and try again. If this error persists please try a different browser/device.',
                  );
                  progress.next({ percentDone: this.currentPercentageFront, error: true });
                  progress.complete();
                  break;
              }
            }
          }
        )
    }
  }

  getPreviewForFrontOfCard() {
    this.frontSub = new Observable<string>(observer => {
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        observer.next(reader.result.toString());
        observer.complete();
      }, false);
      this.igmService.getPreview(DocumentTypeEnum.ID_CARD, DocumentFileTypeEnum.FRONT, 50).subscribe(blob => {
        if (blob) {
          reader.readAsDataURL(blob);
        }
      }, error => {
        console.log('Failed to get inside preview of ID-Book : ' + error.message);
      });
    }).subscribe((result) => {
      this.uploadingFront = false;
      this.frontOfCard = result;
    });
  }

  uploadFileForBackOfCard(event) {
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;
    const progress = new Subject<UploadProgressModel>();

    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.ID_CARD, DocumentFileTypeEnum.BACK, file)
        .pipe().subscribe(
          event => {
            if (event == null) {
              return;
            }
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadingBack = true;
              this.currentPercentageBack = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              const response: ResponseWrapper<any> = event.body;
              const responseCode = response.code;
              switch (responseCode) {
                case ResponseWrapperCodeEnum.OK:
                  // Close the progress-stream if we get an answer form the API
                  // The upload is complete
                  progress.next({ percentDone: 100, success: true });
                  progress.complete();
                  this.getPreviewForBackOfCard();
                  break;
                case ResponseWrapperCodeEnum.UNEXPECTED_ERROR:
                case ResponseWrapperCodeEnum.UPLOAD_FAILED:
                default:
                  alert(
                    'Please check your connection and try again. If this error persists please try a different browser/device.',
                  );
                  progress.next({ percentDone: this.currentPercentageBack, error: true });
                  progress.complete();
                  break;
              }
            }
          }
        )
    }
  }

  getPreviewForBackOfCard() {
    this.backSub = new Observable<string>(observer => {
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        observer.next(reader.result.toString());
        observer.complete();
      }, false);

      this.igmService.getPreview(DocumentTypeEnum.ID_CARD, DocumentFileTypeEnum.BACK, 50).subscribe(blob => {
        if (blob) {
          reader.readAsDataURL(blob);
        }
      }, error => {
        console.log('Failed to get inside preview of ID-Book : ' + error.message);
      });
    }).subscribe((result) => {
      this.uploadingBack = false;
      this.backOfCard = result;
    });
  }

  ngOnDestroy(): void {
    if(this.selfieSub) {
      this.selfieSub.unsubscribe();
    }
    if(this.frontSub) {
      this.frontSub.unsubscribe();
    }
    if(this.backSub) {
      this.backSub.unsubscribe();
    }
  }

  onContinue() {
    console.log("Validating file" + DocumentTypeEnum.ID_CARD);
    this.igmService.requestValidation(DocumentTypeEnum.ID_CARD).subscribe(a =>
      {
        console.log("Validation has been requested");
        this.router.navigate(['/']);
      }
    )
  }

  chooseDifferentDoc() {
    this.router.navigate(['id-documentation']);
  }
}
