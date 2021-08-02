
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Address } from "cluster";
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Eligible } from "../_models/eligible.model";
import { ProfileResponse } from "../_models/profile-response.model";

/**
 * Service for all IGM API calls. This class should encapsulate
 * all logic for fetching, manipulating and displaying data.
 */
@Injectable({ providedIn: 'root' })
export class IgmApiService {
  constructor(
    private http: HttpClient
  ) { }

  //Create the variables
  /**
   * _companyName - Your company or app name like registered on IGM's side.
   * _configID - Stores the site ID the client will obtain from Intergreatme. This is a unique ID obtained from IGM.
   * _apiPath - API Path to call: If PROD: “https://kyc.intergreatme.com/za/api”, else if Dev:	“https://dev.intergreatme.com/kyc/za/api/”
   * _authToken - Authentication token, this will be used to store a cooking on the user's device to Identify the device/user.
   * _originTxId - Origin Transaction ID, a unique GUID you as the client generate to identify a user.
   * _txID - Transaction ID / Whitelist ID / Allowlist ID, this unique GUID IGM returns to you upon the initiating allowlist call.
   */

  _companyName: string = "<Your app/company name>";
  _configID: string = "<Your config ID>";
  _apiPath: string = "https://dev.intergreatme.com/kyc/za/api/"; //Dev else use prod: "https://kyc.intergreatme.com/za/api"
  _authToken: string;
  _txID: string;
  _originTxID: string;

  //Create variable currentProfileObject of type Profile. This will be the current user object.
  currentProfileObject: ProfileResponse;

  //Create the Allowlist API, this will be step 1 in general. A transaction needs to be initiated and this is how.
  sendAllowlistInfo(originID: string, idNumber: string, name: string, surname: string, email: string, mobile: string, address: Address) {
    //Some random test request body data
    /* Request body
    {
      "origin_tx_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      "id_number":"0101010000088",
      "firstname":"Piet",
      "surname":"Doe",
      "email\":"Piet@doe.com",
      "mobile\":"0610000001",
      "line1":"3 Unknown Boulevard",
      "line2":"Unknown street",
      "suburb":"Plumstead",
      "province":"Western Cape",
      "post_code":"7800",
      "country":"South Africa"
    }
    */

    //Converting the input data to a JSON object.
    //Create a data variable of type Map<string, string> to map each field and it's value.
    var data = new Map<string, string>();
    data.set("origin_tx_id", originID);
    data.set("id_number", idNumber);
    data.set("first_name", name);
    data.set("last_name", surname);
    data.set("email", email);
    data.set("mobile", mobile);

    //Combine the fields above and stringify the data variable.
    var payloadContent = JSON.stringify(data);

    //Assign the URL to the appropiate path with the necessary configID and companyName passed in as queryParams
    var url = "https://www.intergreatme.com/api/self-kyc-util/whitelist/?config=" + this._configID + "&name=" + this._companyName;
    //Parse the payload string.
    var payloadString = "{\"payload\":" + JSON.parse(JSON.parse(payloadContent)) + "}";

    //Do a http post request, pass in apiPath and payloadString
    return this.http.post(url, payloadString).pipe(
      map((response: Response) => {
        //Check if the returned statuscode is 200, then continue to parse the payload, else throw error exception.
        if (response.status == 200) {
          var jsonBodyString = JSON.stringify(response.body)["payload"];
          if (jsonBodyString != null) {
            //Decode the response payload of tx_id and origin_tx_id to the local variables
            var jsonBody = JSON.stringify(jsonBodyString);
            var transactionID = jsonBody['tx_id'];
            var originID = jsonBody['origin_tx_id'];
            //Check if decoded values are valid, if valid assign to global variables _txID and _originTxID
            if (transactionID != null && originID != null) {
              this._txID = transactionID;
              this._originTxID = originID;
            } else {
              throw ("Failed to get transactionId or originId");
            }
          } else {
            throw ("Failed to get payload");

          }
        } else {
          throw ("Request failed, code[" + response.status.toString() + "]");
        }
        return response;
      }), catchError(error => {
        return throwError(error);
      })
    );
  }


  //Create the getEligible API
  getEligible() {
    //To log in a user hit the /user/eligible endpoint – this endpoint accepts a JSON object, you will need to provide the tx_id – returned from previous call - and the origin_tx_id – provided to previous call; sets a cookie (kyc-auth)
    /* Request body
    {
      "tx_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      "origin_tx_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }
    */
    //Get the headers and stringify body.
    let options = this.getHeaders();
    let body = JSON.stringify(["tx_id", this._txID, "origin_tx_id", this._originTxID]);

    return this.http.post(this._apiPath + `user/eligible`, body, options)
      .pipe(
        map((response: Response) => {
          //Check if the returned statuscode is 200, then continue to stringify the response body data, else throw error exception.
          if (response.status == 200) {
            var jsonBodyString = JSON.stringify(response.body)["data"];
            if (jsonBodyString != null) {
              //Parse/decode the payload and assign the object keys to the Eligible type.
              let eligible: Eligible;
              let data = JSON.parse(jsonBodyString);
              eligible.eligible = data['eligible'];
              eligible.authToken = data['auth_token'];
              eligible.completeState = data['complete_state'];
              eligible.shareID = data['share_id'];
              //Check if completeState is Incomplete, if so, set the authtoken. Else throw error.
              if (eligible.completeState == "INCOMPLETE") {
                this._authToken = eligible.authToken;
                return eligible;
              } else {
                // CONSENT, COMPLETE, TIMEOUT are the other values that may come through
                throw ("Cannot start [" + eligible.completeState + "]");
              }
            } else {
              throw ("Failed to get data");
            }
          } else {
            throw ("Request failed, code[" + response.status.toString() + "]");
          }
        }), catchError(error => {
          return throwError(error);
        })
      );
  }


  //Create the getProfile API, fetch the profile and check the state of items.
  getProfile() {
    //Get and set headers
    let options = this.getHeaders();
    //This will be a http get request.
    return this.http.get(this._apiPath + `user/profile`, options).pipe(
      map((response: Response) => {
        //Check if the returned statuscode is 200, then continue to stringify the response body data, else throw error exception.
        if (response.status == 200) {
          var jsonData = JSON.stringify(response.body);
          // possible response codes
          // [ OK, UNEXPECTED_ERROR, CONFIG_NOT_FOUND, UNAUTHORIZED_ACTION, REGISTER_NOT_ELIGIBLE, OTP_SERVICE_UNAVAILABLE, BAD_DATA_PROVIDED, FIRST_NAME_REQUIRED, LAST_NAME_REQUIRED ]

          //Check if code is OK, then set the currentProfileObject, else throw exception.
          //Parse all fields from JsonData and assign the profile, that's if status code is OK.
          if (jsonData['code'] == "OK") {
            let profile: ProfileResponse;
            let data = JSON.parse(jsonData);
            profile.id = data['id'];
            profile.origin_tx_id = data['origin_tx_id'];
            profile.unique_field = data['unique_field'],
              profile.document_number = data['document_number'],
              profile.passport_country = data['passport_country'],
              profile.use_passport = data['use_passport'],
              profile.first_name = data['first_name'],
              profile.last_name = data['last_name'],
              profile.email_address = data['email_address'],
              profile.address = data['address'],
              profile.documents = data['documents'],
              profile.share_status = data['share_status'],
              profile.share_success = data['share_success'],
              profile.liveliness_state = data['liveliness_state'];
            this.currentProfileObject = profile;
            return this.currentProfileObject;
          } else {
            throw ("Failed to get data");
          }
        } else {
          throw ("Request failed, code[" + response.status.toString() + "]");
        }
      }), catchError(error => {
        return throwError(error);
      })
    );
  }

  //Create the uploadFile API
  //Used fo uploading of each file, this will be repeated for all files in each specific group. (Selfie, front, back)
  //Call the /file/upload endpoint for each file, one at a time, in no particular order – IGM will create a ‘Document’ object when the first file is uploaded for a given document type. (ID_CARD)

  //Should be of return type boolean
  uploadFile(documentType: string, documentFileType: string, mime: string, file: File) {
    // NB: Files for Identity documents should be photographed at the time. i.e. DO NOT allow file uploads; Process requires image format (jpeg / png supported)
    /* request body example
    {
      "share": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "documentType": "string",
      "documentFileType": "string",
      "mime": "string",
      "file": {}
    }
    */


    // var fileName = basename(file.name); //Find out whether this is file.path or file.name for angular
    // var fileType = "";

    //Ensure that the mime type is correct, IGM only accepts PDFs or images. Do a sanity check.
    //Do validation check whether the file ends with .pdf, if so set equal to filetype application/pdf
    //else, filetype image.
    // if (fileName.toLowerCase().endsWith('.pdf')) {
    //   fileType = 'application/pdf';
    // } else {
    //   var index = fileName.indexOf('.');
    //   if (index > -1) {
    //     fileType = 'image/' + fileName.substring(index + 1);
    //   }
    // }

    //Find out what MultipartRequest does? It's still a post with a Uri.parse url. SO perhaps more than on request at a time?
    //Do more research on what comes in here, what do we set and what do we pass in.
    this.http.post(this._apiPath + `file/upload`, file)//What body gets passed in?
      .pipe(map((response: Response) => {
        // Check if response status is 200, return true, lse throw exception that Upload failed.
        if (response.status == 200) {
          return response;
        } else {
          throw ("Upload  failed");
        }
      }), catchError(error => {
        return throwError(error);
      })
      );
  }

  //Create the getFileThumbnail API
  //Get the preview of the file that was uploaded by the user.
  //Should be return type String.
  getFileThumbnail(documentType: string, documentFileType: string, maxWidth: string) {
    //Get request to obtain the uri where document has been stored.
    //Contains the apiPath, and three query params. Document TYpe, DocumentFileType and maxwidth
    let options = this.getHeaders();

    this.http.get(this._apiPath + `file/getFileThumbnail?documentType=` + documentType + `&documentFileType=` + documentFileType + `&maxWidth=` + maxWidth.toString(), options)
      .pipe(map((response: Response) => {
        return response;
      }), catchError(error => {
        return throwError(error);
      })
      );

    //Might need to add more functionality to this, checking the file, validating it and listening to the subscription and unsubscribing.
  }

  //Create the requestValidation APIUsed to submit all document files for validation.
  //NB: IGM will validate all the required files for a given ‘Document’ at once. The user will need to upload all documents again should this process fail. i.e. we only give a status for the entire collection
  requestValidation(documentType: string) {
    //Post request that will pass in the documentType as a body with the required headers.
    let options = this.getHeaders();
    //Parse the documentType as a JSON Object
    let body = JSON.parse(documentType);
    this.http.post(this._apiPath + `file/requestValidation`, body, options)
      .pipe(map((response: Response) => {
        if (response.status == 200) {
          var jsonData = JSON.stringify(response.body);
          return jsonData['code'];
        } else {
          throw ("Request failed, code[" + response.status.toString() + "]");
        }
      }), catchError(error => {
        return throwError(error);
      })
      );
  }

  //Create the getLivelinessInstructions API,
  //Should be of return type LivelinessInstructions
  getLivelinessInstructions() {
    //Get request, that returns the instructions for each movement.
    let options = this.getHeaders();
    this.http.get(this._apiPath + `liveliness/instructions`, options).pipe(
      map((response: Response) => {
        if (response.status == 200) {
          var jsonData = JSON.stringify(response.body);
          // possible response codes
          // [ OK, UNEXPECTED_ERROR, CONFIG_NOT_FOUND, UNAUTHORIZED_ACTION, REGISTER_NOT_ELIGIBLE, OTP_SERVICE_UNAVAILABLE, BAD_DATA_PROVIDED, FIRST_NAME_REQUIRED, LAST_NAME_REQUIRED ]
          if(jsonData['code'] == "OK") {
            return jsonData['code'];
          } else {
            return jsonData['code'];
          }
        } else {
          throw ("Request failed, code[" + response.status.toString() + "]");
        }
      }), catchError(error => {
        return throwError(error);
      })
    );
  }



  //Create a getHeaders() function
  //Reusable code to be used instead of building the headers each time for each http request.
  getHeaders() {
    /* The set headers required for most of the above Restful API calls,
    * config = _configID
    * Authorization = "bearer" + _authToken
    * Content-Type = application/json
    */
    if (this._authToken != null) {
      const httpOptions = {
        headers: new HttpHeaders({
          config: this._configID,
          Authorization: 'bearer' + this._authToken,
          'Content-Type': 'application/json'
        })
      }
      return httpOptions;
    } else {
      const httpOptions = {
        headers: new HttpHeaders({
          config: this._configID,
          'Content-Type': 'application/json'
        })
      }
      return httpOptions;
    }

  }


  //Create a clearAll() function that will clear the session info
  clearAll() {
    /*Should be used to clear the current session, set the following to null
    * Authtoken, transactionID, originTransactionID and currentProfileObject.
    */
    this._authToken = null;
    this._txID = null;
    this._originTxID = null;
    this.currentProfileObject = null;
  }
}
