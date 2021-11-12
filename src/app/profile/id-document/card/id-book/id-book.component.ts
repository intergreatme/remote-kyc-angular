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
  selector: 'app-id-book',
  templateUrl: './id-book.component.html',
  styleUrls: ['./id-book.component.css']
})
export class IdBookComponent implements OnInit, OnDestroy {
  selfie: any;
  inside: any;

  fileType: string;
  txID: string;
  selfieSub: Subscription;
  insideSub: Subscription;
  
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
}
