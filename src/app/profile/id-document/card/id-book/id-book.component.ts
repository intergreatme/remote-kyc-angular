import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentTypeEnum } from 'src/app/_models/document-type.enum';
import { CookieService } from 'src/app/_services/cookie.service';
import { IgmService } from 'src/app/_services/igm.service';

@Component({
  selector: 'app-id-book',
  templateUrl: './id-book.component.html',
  styleUrls: ['./id-book.component.css']
})
export class IdBookComponent implements OnInit {

  constructor(
    private igmService: IgmService,
    private cookieService: CookieService,
    private router: Router
    ) { }

  ngOnInit(): void {
  }


  validateFile() {
    var auth = this.cookieService.getCookie("kyc-auth");
    console.log("The kyc-auth cookie token is: " + auth);

    console.log("Validating file" + DocumentTypeEnum.ID_BOOK);

    this.igmService.requestValidation(DocumentTypeEnum.ID_BOOK).subscribe(a =>
      console.log(a)
    )
  }

  onContinue() {
    //Route back to the Profile component
    this.router.navigate(['/'])
  }
}
