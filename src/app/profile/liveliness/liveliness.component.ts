import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DocumentTypeEnum } from 'src/app/_models/document-type.enum';
import { LivelinessInstructions } from 'src/app/_models/liveliness-instructions.model';
import { ResponseWrapperCodeEnum } from 'src/app/_models/response-wrapper-code.enum';
import { ResponseWrapper } from 'src/app/_models/response-wrapper.model';
import { IgmService } from 'src/app/_services/igm.service';

@Component({
  selector: 'app-liveliness',
  templateUrl: './liveliness.component.html',
  styleUrls: ['./liveliness.component.css']
})
export class LivelinessComponent implements OnInit, OnDestroy {
  liveliness: any;
  fileType: string;
  txID: string;
  livelinessSub: Subscription;
  uploadResponse: any;

  constructor(
    private igmService: IgmService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
  }

  uploadFile(event) {
  }

  validateFile() {
  }

  getLiveliness() {
    this.igmService.getLivelinessInstructions().pipe().subscribe(
      (wrappedResponse: ResponseWrapper<LivelinessInstructions>) => {
        const code = wrappedResponse.code;
        console.log(code);
        if (code != ResponseWrapperCodeEnum.OK) {
          console.log("Failed: " + code);
        } else {
          console.log("200 Do the things!");
          const response = wrappedResponse.data;
          console.log(response);

          //Example response would be:
        //   {
        //     liveliness_id: "94e8bbfe-c47b-4ff7-a602-f831fb1c1075", instructions: Array(3) }
        //   instructions: Array(3)
        //   0:
        //   gesture: "LOOK_UP"
        //   gesture_category: "LOOK"
        //   word: null
        //   __proto__: Object
        //   1:
        //   gesture: "HEAD_SHAKE"
        //   gesture_category: "HEAD_MOVEMENT"
        //   word: null
        //   __proto__: Object
        //   2:
        //   gesture: "MOUTH_MOVED"
        //   gesture_category: "MOUTH"
        //   word: "Seasonal"
        //   __proto__: Object
        //   length: 3
        //   __proto__: Array(0)
        //   liveliness_id: "94e8bbfe-c47b-4ff7-a602-f831fb1c1075"
        //   __proto__: Object
        // }
        }
      });
  }


  onContinue() {
    //Route back to the Profile component
    this.router.navigate(['/'])
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.livelinessSub) {
      this.livelinessSub.unsubscribe();
    }
  }
}
