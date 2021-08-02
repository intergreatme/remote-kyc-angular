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
  selector: 'app-back',
  templateUrl: './back.component.html',
  styleUrls: ['./back.component.css']
})
export class BackComponent implements OnInit, OnDestroy {
  image: any;
  fileType: string;
  txID: string;
  imageSub: Subscription;
  uploadResponse: any;

  constructor(
    private igmService: IgmService,
    private cookieService: CookieService,
    private uploadService: UploadService,
    private route: Router,
  ) {
  }

  ngOnInit(): void {
  }


  uploadFile(event) {
    console.log(event.target.files[0].type);

    //We need to check the mime type. We only accept Images and PDF for all documents.
    this.fileType = event.target.files[0].type;
    this.txID = environment.txID;

    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];

      this.uploadService.upload(this.txID, DocumentTypeEnum.ID_CARD, DocumentFileTypeEnum.BACK, file)
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
                this.getPreview();
              };
            }
          }
        )
    }
  }

  getPreview() {
    this.imageSub = new Observable<string>(observer => {
      // Service call
      // read the downloaded image
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        observer.next(reader.result.toString());
        observer.complete();
      }, false);

      this.igmService.getPreview(DocumentTypeEnum.ID_CARD, DocumentFileTypeEnum.BACK, 50).subscribe(blob => {
        console.log(blob);

        if (blob) {
          reader.readAsDataURL(blob);
        }
      }, error => {
        console.log('Failed to get front preview of ID-Card : ' + error.message);
      });
    }).subscribe((result) => {
      this.image = result;
      console.log(this.image);
    });
  }

  onContinue() {
    //Route back to the ID-Card component
    this.route.navigate(['id-documentation/id-card'])
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.imageSub) {
      this.imageSub.unsubscribe();
    }
  }
}
