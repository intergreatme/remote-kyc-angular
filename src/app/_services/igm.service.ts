import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";

import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Allowlist } from "../_models/allowlist.model";
import { DocumentFileTypeEnum } from "../_models/document-file-type.enum";
import { DocumentTypeEnum } from "../_models/document-type.enum";
import { Eligible } from "../_models/eligible.model";
import { LivelinessInstructions } from "../_models/liveliness-instructions.model";
import { ProfileResponse } from "../_models/profile-response.model";
import { ResponseWrapper } from "../_models/response-wrapper.model";
import { CookieService } from "./cookie.service";

@Injectable({ providedIn: 'root' })
export class IgmService {
  // Things to note: Setup environments in such a manner than when it requests the environmental API, it should route to /api, the proxy will then replace the localhost:4200 request to the correct URL.
  // Make sure to add the changeOrigin to the proxy config else cloudfare will error out on 1003, Forbidden, the direct IP address is not allowed.
  // node doesnt trust cloudflare's CA certificate hence the need for changeOrigin was required.
  /**
 * _companyName - Your company or app name like registered on IGM's side.
 * _configID - Stores the site ID the client will obtain from Intergreatme. This is a unique ID obtained from IGM.
 * _apiPath - API Path to call: If PROD: “https://kyc.intergreatme.com/za/api”, else if Dev:	“https://dev.intergreatme.com/kyc/za/api/”
 * _authToken - Authentication token, this will be used to store a cooking on the user's device to Identify the device/user.
 * _originTxId - Origin Transaction ID, a unique GUID you as the client generate to identify a user.
 * _txID - Transaction ID / Whitelist ID / Allowlist ID, this unique GUID IGM returns to you upon the initiating allowlist call.
 */


  constructor(private http: HttpClient, private cookieService: CookieService){}

  //Call Remote server to obtain server to server that was already started. Call that specific service to obtain the tx_id and origin_tx_id
  //https://www.intergreatme.com/remote-kyc/go/expand/?{shortlink}
  //Will return a tx_id and origin_tx_id that will continue/start the process
  //Shortlink to test -> 60c329234895d

  //Write a method that initiates the process and call the above API to obtain the tx_id and origin_tx_id
  //Get parameter. ApiPath https://www.intergreatme.com/remote-kyc/go/expand/ and a path param {shortlink}
  //Initially the QR code will be generated, scanned and give us this info, similar to what will be done below.

  getAllowlistDetails(uniqueFieldID: string) {
    // var url = 'https://intergreatme.com/remote-kyc/go/expand/?';
    //This should return a tx_id and a origin_tx_id
    return this.http.get<Allowlist>(`https://intergreatme.com/remote-kyc/go/expand/?${uniqueFieldID}`).pipe(
      map((allowlist: Allowlist) => {
        return allowlist;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }

  //To log in a user hit the /user/eligible endpoint – this endpoint accepts a JSON object, you will need to provide the tx_id – returned from previous call - and the origin_tx_id – provided to previous call; sets a cookie (kyc-auth)
  /* Request body
  {
    "unique_field": "60c329234895d",
    "tx_id": "86e38a5d-df14-4885-bb4c-9c642ec72a21",
    "origin_tx_id": "8b4d73ff-0873-5b42-59bf-e7b315bb46ed"
  }
  */
  //To pass in the request body and apiPath as per environment.
  checkEligibility(txID: string, originTxID: string) {
    // Set the body and make sure the post request is of return type Eligible. This will include the following:
    // eligible: boolean;
    // shareID: string; //UUID
    // completeState: string; // INCOMPLETE, CONSENT, COMPLETE, TIMEOUT
    // authToken: string;
    // The response will also be wrapped arounda responsewrapper http status code. First check the Status code and if 200 = OK status then decode the info.
    // MOST NB RETURNED FIELD IS YOUR auth_token, you will store this as a cookie. And this will be used for the upcoming requests.
    /*
    * A typical response would be:
    {
      "code": "OK",
      "data": {
        "eligible": true,
        "share_id": "86e38a5d-df14-4885-bb4c-9c642ec72a21",
        "complete_state": "INCOMPLETE",
        "auth_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI4NmUzOGE1ZC1kZjE0LTQ4ODUtYmI0Yy05YzY0MmVjNzJhMjEiLCJhdWQiOiJJR01fS1lDX01PRFVMRSIsIm5iZiI6MTYyMzQyMDUwMywicm9sZXMiOlsiS1lDX1NIQVJFIl0sImRpc3BsYXkiOiJHZXJ0IFN0ZWVua2FtcCIsImlzcyI6IklOVEVSR1JFQVRNRS1LWUMiLCJzaGFyZSI6Ijg2ZTM4YTVkLWRmMTQtNDg4NS1iYjRjLTljNjQyZWM3MmEyMSIsImV4cCI6MTYyNDAyNTMwMywiaWF0IjoxNjIzNDIwNTAzLCJjb25maWciOiI0MWQ5ZGI2OC1jZWJmLTQwNDUtYTA1YS02NWY5MWJiYzQwMTAiLCJqdGkiOiJhYTAzM2U1Ni02NTA3LTQ4Y2MtOTY2NS1lZGY2N2M0MTNhMmYifQ.zXw65SgyccbUQkmq4F8ome1fwCOXZ9kEXiSBPuorwKw"
      }
    }
    */
    let body = { 'tx_id': txID, 'origin_tx_id': originTxID };

    // Even though Content-type is by default application/json, make sure to set the correct headers.
    // The config header must be included else you will not receive a response.
    // In this case my configID is setup in my environment files. However, your config IDs will be provided by IGM, one for Dev and one for Prod.
    const httpOptions = {
      headers: new HttpHeaders({
        'config': environment.configId,
        'Content-Type': 'application/json',
      })
    }

    return this.http.post<ResponseWrapper<Eligible>>(environment.apiPath + `/user/eligible`, body, httpOptions).pipe(
      map((response: ResponseWrapper<Eligible>) => {
        //Check if Response code is 200/OK, then return the response data, else catch error.
        return response;
      }), catchError(error => {
        return throwError("Eligibility check failed" + error);
      })
    );
  }

  //Next step is to get the Profile. The profile will display the statusses and progress of each document type.
  //Create a service that will do a http get request, this will talk to the apiPath + `user/profile` + headers.
  /* The following three headers will be required for every other http request.
  * config = _configID
  * Authorization = "bearer" + _authToken
  * Content-Type = application/json
  */ //For the same purpose, i've created a seperate method getHeaders() that will check build the headers each time.

  //Again the response is wrapped arround a Response wrapper, first check if the status code is 200/OK then return data.
  //The return data will be of type ProfileResponse.
  //getProfile should be called reguraly, not shorter than ever 15 seconds. This will provide constant updates whether the user has made any additional progress.
  getProfile() {
    var authToken = this.cookieService.getCookie("kyc-auth");

    const httpOptions = {
      headers: new HttpHeaders({
        'config': environment.configId,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      })
    }

    return this.http.get<ResponseWrapper<ProfileResponse>>(environment.apiPath + `/user/profile`, httpOptions).pipe(
      map((response: ResponseWrapper<ProfileResponse>) => {
        return response;
      }), catchError(error => {
        return throwError("Unable to obtain Profile details" + error);
      })
    );
  }



  //Uploading each and every individual file
  //This will be repeated for all files in each specific group. (Selfie, front, back)
  //Call the /file/upload endpoint for each file, one at a time, in no particular order – IGM will create a ‘Document’ object when the first file is uploaded for a given document type. (ID_CARD)
  uploadFile(formData: FormData) {
    //Upload a new file of a particular type for the logged in user.
    //This method expects a multipart-form request to stream the file in.<br/>The
    //<code>file</code> parameter is the file multipart-form parameter

    //Must be multipart-form request
    //Not JSON PAYLOAD!

    // create a http-post request and pass the form
    // tell it to report the upload progress


    //share: string but of format UUID. This is the shareID. In other words this is the tx_id.

    //Document Type can be any of the following: type: string
    //UNDEFINED, SELFIE, ID_BOOK, ID_CARD, DRIVERS_LICENCE, PASSPORT, PROOF_OF_RESIDENCE, MARRIAGE_CERTIFICATE

    //Document filetype must be one of the following: type: string
    //<i>Available values</i>: SELFIE, FRONT, BACK

    // mime: Type string but what filetype is it. pdf and images is the only files IGM accepts


    //The problem is to get the mime type, there for we declare a new variable called fileName, we call the file.get("<appendedname> from fromData")
    //this will return a JSON object, where we can call the type and name of the file directly.

    // var fileName = basename(file.name);

    //TODO implement a check if fileName[type] is pdf or images, else dont continue

    //File = {} consist of the blob file. Type: object

  }


  // Return a thumbnail preview of the image uploaded.
  // Get a scaled down copy of the requested file image, at the requested
  // width, for the logged in userDefined possible explicit error codes: <code>UNEXPECTED_ERROR</code>'

    //Passed in as queryparams documentType = ID_BOOK, ID_CARD, DocumentTypeFile = FRONT, SELFIE, etc.
    //Remember to pass in a maxwidth of the file.
  getPreview(documentType: DocumentTypeEnum, documentFileType: DocumentFileTypeEnum, maxWidth: number) {
      var authToken = this.cookieService.getCookie("kyc-auth");

      const headers = {
            'config': environment.configId,
            'Authorization': `Bearer ${authToken}`,
          };

      console.log("Info to passed in DocumentType: " + documentType + " DocumentFileType: " + documentFileType + " maxWidth: " + maxWidth);

      return this.http.get(environment.apiPath + `/file/getFileThumbnail?documentType=${documentType}&documentFileType=${documentFileType}&maxWidth=${maxWidth.toString()}`, {headers, responseType: 'blob',});
    }


  //Create the requestValidation APIUsed to submit all document files for validation.
  //NB: IGM will validate all the required files for a given ‘Document’ at once. The user will need to upload all documents again should this process fail. i.e. we only give a status for the entire collection
  requestValidation(documentType: DocumentTypeEnum) {
    //documentType => ID_BOOK, ID_CARD, PROOF_OF_RESIDENCE
    //Post request that will pass in the documentType as a body with the required headers.
    var authToken = this.cookieService.getCookie("kyc-auth");

    const httpOptions = {
      headers: new HttpHeaders({
        'config': environment.configId,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      }),
    }

    return this.http.post(environment.apiPath + `/file/requestValidation`, documentType, httpOptions)
      .pipe(map((response: ResponseWrapper<any>) => {
        return response;
      }), catchError(error => {
        return throwError("Unable to validate file" + error);
      })
      );
  }

  //Get LivelinessInstructions
  getLivelinessInstructions() {
    var authToken = this.cookieService.getCookie("kyc-auth");

    const httpOptions = {
      headers: new HttpHeaders({
        'config': environment.configId,
        'Authorization': `Bearer ${authToken}`,
      }),
    }

    return this.http.get(environment.apiPath + `/liveliness/instructions`, httpOptions)
    .pipe(map((response: ResponseWrapper<LivelinessInstructions>) => {
      return response;
    }), catchError(error => {
      return throwError("Unable to get liveliness instructions " + error);
    })
    );
  }


  logout() {
  //Destroy the auth cookie. This will logout the user.
    return this.http.get(environment.apiPath + `/user/logout`)
    .pipe(map((response: ResponseWrapper<any>) => {
      return response;
    }), catchError(error => {
      return throwError("Unable to logout user " + error);
    })
    );
  }



  //Create a getHeaders() function
  //Reusable code to be used instead of building the headers each time for each http request.
  getHeaders(authToken: string, configID: string) {
    /* The set headers required for most of the above Restful API calls,
    * config = _configID
    * Authorization = "bearer" + _authToken
    * Content-Type = application/json
    */
    if (authToken != null) {
      const httpOptions = {
        headers: new HttpHeaders({
          'config': configID,
          'Authorization': 'bearer' + authToken,
          'Content-Type': 'application/json'
        })
      }
      return httpOptions;
    } else {
      const httpOptions = {
        headers: new HttpHeaders({
          'config': configID,
          'Content-Type': 'application/json'
        })
      }
      return httpOptions;
    }
  }
}
