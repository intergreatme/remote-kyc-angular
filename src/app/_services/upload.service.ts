import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { delay, first, map, retryWhen } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { DocumentFileTypeEnum } from "../_models/document-file-type.enum";
import { DocumentTypeEnum } from "../_models/document-type.enum";
import { ResponseWrapperCodeEnum } from "../_models/response-wrapper-code.enum";
import { ResponseWrapper } from "../_models/response-wrapper.model";
import { CookieService } from "./cookie.service";

@Injectable({ providedIn: 'root' })
export class UploadService {
  maxRetryAttempts = 5;
  retryDelay = 3000;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  upload(share: string, documentType: DocumentTypeEnum, documentFileType: DocumentFileTypeEnum, file: File) {
    //This will create a new multipart-form for every uploaded file.
    //Like the API swagger document states,
    // Upload a new file of a particular type for the logged in user.
    // This method expects a multipart-form request to stream the file in.<br/>The
    // <code>file</code> parameter is the file multipart-form parameter

    const formData: FormData = new FormData();

    let fileName = file.name;
    formData.append('file', file, fileName);

    let fileType = file.type;

    //TODO Create a upload progress subject for every file;
    //TODO Do a sanity check to ensure that the uploaded file is either a .pdf or an image.
    if(fileName.toLowerCase().endsWith('.pdf')) {
      fileType = 'application/pdf';
    } else {
      var index = fileName.indexOf('.');
      if(index > -1) {
        fileType = 'image/' + fileName.substr(index + 1);
      }
    }

    //TODO Resize the Image. Set the maxDimensions to 1920, if it's a PDF set it to 2500
    //TODO implement a timeout, to give the UI time to update. Once done call the next function processUpload.
    //TODO Create a new FormData and append each of the required files to the formData.

    formData.append('mime', fileType);
    formData.append('share', share);
    formData.append('documentType', documentType);
    formData.append('documentFileType', documentFileType);

    var authToken = this.cookieService.getCookie("kyc-auth");

    const httpOptions = {
      headers: new HttpHeaders({
        'config': environment.configId,
        'Authorization': `Bearer ${authToken}`,
      }),
    }

    //TODO create a http-post request and pass the form, tell it to report the upload progress.
    const request = new HttpRequest('POST', environment.apiPath + `/file/upload`, formData, httpOptions);
    //TODO send the http-request and subscribe for progress-updates.
    return this.http.request<ResponseWrapper<any>>(request);
  }



  getPreview(documentType: DocumentTypeEnum, documentFileType: DocumentFileTypeEnum, maxWidth: number) {
    var authToken = this.cookieService.getCookie("kyc-auth");

    const headers = {
          'config': environment.configId,
          'Authorization': `Bearer ${authToken}`,
        };

    console.log("Info to passed in DocumentType: " + documentType + " DocumentFileType: " + documentFileType + " maxWidth: " + maxWidth);

    return this.http.get(environment.apiPath + `/file/getFileThumbnail?documentType=${documentType}&documentFileType=${documentFileType}&maxWidth=${maxWidth.toString()}`, {headers, responseType: 'blob',});
  }
}
