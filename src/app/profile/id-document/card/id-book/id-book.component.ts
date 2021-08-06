import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { DocumentFileTypeEnum } from 'src/app/_models/document-file-type.enum';
import { DocumentTypeEnum } from 'src/app/_models/document-type.enum';
import { ResponseWrapperCodeEnum } from 'src/app/_models/response-wrapper-code.enum';
import { ResponseWrapper } from 'src/app/_models/response-wrapper.model';
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


  constructor(
    private igmService: IgmService,
    private router: Router,
    private uploadService: UploadService,
    ) { }

  ngOnInit(): void {

    console.log(this.selfie);
    console.log(this.inside);

    if(this.selfie != null)
    {
      this.getPreviewForSelfie();
    }
  }

  uploadFileForSelfie(event) {
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;

    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.ID_BOOK, DocumentFileTypeEnum.SELFIE, file)
        .pipe().subscribe(
          event => {
            if (event == null) {
              return;
            } else if (event instanceof HttpResponse) {
              //Response is of type HttpResponse. We need to decode the body in order to check if the code is 200 or not. if 200 ok, then we call the getPreview function to display the image.
              console.log(event);
              const response: ResponseWrapper<any> = event.body;
              if (response.code = ResponseWrapperCodeEnum.OK) {
                console.log("The response is: " + response.code + ", therefor we will get the preview");
                this.getPreviewForSelfie();
              };
            }
          }
        )
    }
  }

  getPreviewForSelfie() {
    this.selfieSub = new Observable<string>(observer => {
      // Service call
      // read the downloaded image
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
      this.selfie = result;
    });
  }


  uploadFileForInside(event) {
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;

    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.ID_BOOK, DocumentFileTypeEnum.FRONT, file)
        .pipe().subscribe(
          event => {
            if (event == null) {
              return;
            } else if (event instanceof HttpResponse) {
              //Response is of type HttpResponse. We need to decode the body in order to check if the code is 200 or not. if 200 ok, then we call the getPreview function to display the image.
              console.log(event);
              const response: ResponseWrapper<any> = event.body;
              if (response.code = ResponseWrapperCodeEnum.OK) {
                console.log("The response is: " + response.code + ", therefor we will get the preview");
                this.getPreviewForInside();
              };
            }
          }
        )
    }
  }

  getPreviewForInside() {
    this.insideSub = new Observable<string>(observer => {
      // Service call
      // read the downloaded image
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        observer.next(reader.result.toString());
        observer.complete();
      }, false);

      this.igmService.getPreview(DocumentTypeEnum.ID_BOOK, DocumentFileTypeEnum.FRONT, 50).subscribe(blob => {
        console.log(blob);

        if (blob) {
          reader.readAsDataURL(blob);
        }
      }, error => {
        console.log('Failed to get inside preview of ID-Book : ' + error.message);
      });
    }).subscribe((result) => {
      this.inside = result;
    });
  }

  validateFile() {
    console.log("Validating file" + DocumentTypeEnum.ID_BOOK);
    this.igmService.requestValidation(DocumentTypeEnum.ID_BOOK).subscribe(a =>
      {
        console.log("Validation has been requested");
        this.onContinue();
      }
    )
  }

  onContinue() {
    //Route back to the Profile component
    this.router.navigate(['/'])
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.selfieSub) {
      this.selfieSub.unsubscribe();
    }
    if(this.insideSub) {
      this.insideSub.unsubscribe();
    }
  }

}
