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
  selector: 'app-proof-of-residence',
  templateUrl: './proof-of-residence.component.html',
  styleUrls: ['./proof-of-residence.component.css']
})
export class ProofOfResidenceComponent implements OnInit, OnDestroy {
  por: any;
  fileType: string;
  txID: string;
  porSub: Subscription;
  uploadResponse: any;
  uploadingPor = false;
  currentPercentagePor = 0;

  constructor(
    private igmService: IgmService,
    private uploadService: UploadService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
  }


  uploadFile(event) {
    console.log(event.target.files[0].type);
    const progress = new Subject<UploadProgressModel>();
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;

    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.PROOF_OF_RESIDENCE, DocumentFileTypeEnum.FRONT, file)
      .pipe().subscribe(
        event => {
          if (event == null) {
            return;
          }
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadingPor = true;
            this.currentPercentagePor = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            const response: ResponseWrapper<any> = event.body;
            const responseCode = response.code;
            switch (responseCode) {
              case ResponseWrapperCodeEnum.OK:
                // Close the progress-stream if we get an answer form the API
                // The upload is complete
                progress.next({ percentDone: 100, success: true });
                progress.complete();
                this.getPreview();
                break;
              case ResponseWrapperCodeEnum.UNEXPECTED_ERROR:
              case ResponseWrapperCodeEnum.UPLOAD_FAILED:
              default:
                alert(
                  'Please check your connection and try again. If this error persists please try a different browser/device.',
                );
                progress.next({ percentDone: this.currentPercentagePor, error: true });
                progress.complete();
                break;
            }
          }
        }
      )
    }
  }

  getPreview() {
    this.porSub = new Observable<string>(observer => {
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        observer.next(reader.result.toString());
        observer.complete();
      }, false);
      this.igmService.getPreview(DocumentTypeEnum.PROOF_OF_RESIDENCE, DocumentFileTypeEnum.FRONT, 50).subscribe(blob => {
        if (blob) {
          reader.readAsDataURL(blob);
        }
      }, error => {
        console.log('Failed to get preview of POR : ' + error.message);
      });
    }).subscribe((result) => {
      this.uploadingPor = false;
      this.por = result;
    });
  }


  onContinue() {
    console.log("Validating file" + DocumentTypeEnum.PROOF_OF_RESIDENCE);
    this.igmService.requestValidation(DocumentTypeEnum.PROOF_OF_RESIDENCE).subscribe(a =>
      {
        console.log("Validation for POR has been requested");
        this.router.navigate(['/'])
      }
    )
  }

  onBack() {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.porSub) {
      this.porSub.unsubscribe();
    }
  }
}
