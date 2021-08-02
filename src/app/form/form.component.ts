import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  allowlistFormGroup: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    ) {}

  ngOnInit(): void {
    this.allowlistFormGroup = this.formBuilder.group({
      idNumber: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      mobileNumber: new FormControl('', Validators.required),
      unitComplex: new FormControl('', Validators.required),
      line1: new FormControl('', Validators.required),
      line2: new FormControl(''),
      suburb: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      province: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
    });
  }

  onNext() {
    this.router.navigate(["profile"]);
  }
}
