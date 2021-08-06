import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-id-document',
  templateUrl: './id-document.component.html',
  styleUrls: ['./id-document.component.css']
})
export class IDDocumentComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onBack() {
    //Route back to the Profile component
    this.router.navigate(["/"])
  }

  routeToIdBook() {
    this.router.navigate(["id-documentation/id-book"]);
  }

  routeToIdCard() {
    this.router.navigate(["id-documentation/id-card"]);
  }
}
