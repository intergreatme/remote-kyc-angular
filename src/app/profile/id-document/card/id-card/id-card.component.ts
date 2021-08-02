import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentTypeEnum } from 'src/app/_models/document-type.enum';
import { CookieService } from 'src/app/_services/cookie.service';
import { IgmService } from 'src/app/_services/igm.service';

@Component({
  selector: 'app-id-card',
  templateUrl: './id-card.component.html',
  styleUrls: ['./id-card.component.css']
})
export class IdCardComponent implements OnInit {

  constructor(private cookieService: CookieService,
              private igmService: IgmService,
              private router: Router) { }

  ngOnInit(): void {
  }


  validateFile() {
    var auth = this.cookieService.getCookie("kyc-auth");
    console.log("The kyc-auth cookie token is: " + auth);

    console.log("Validating file" + DocumentTypeEnum.ID_CARD);

    this.igmService.requestValidation(DocumentTypeEnum.ID_CARD).subscribe(a =>
      console.log(a)
    )
  }

  onContinue() {
    //Route back to the Profile component
    this.router.navigate(['/'])
  }
}
