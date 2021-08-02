import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './_helpers/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { IdCardComponent } from './profile/id-document/card/id-card/id-card.component';
import { IdBookComponent } from './profile/id-document/card/id-book/id-book.component';
import { ProofOfResidenceComponent } from './profile/proof-of-residence/proof-of-residence.component';
import { LivelinessComponent } from './profile/liveliness/liveliness.component';
import { IDDocumentComponent } from './profile/id-document/id-document.component';
import { FrontComponent } from './profile/id-document/card/id-card/uploads/front/front.component';
import { BackComponent } from './profile/id-document/card/id-card/uploads/back/back.component';
import { InsideComponent } from './profile/id-document/card/id-book/uploads/inside/inside.component';
import { BookSelfieComponent } from './profile/id-document/card/id-book/uploads/selfie/book-selfie.component';
import { CardSelfieComponent } from './profile/id-document/card/id-card/uploads/selfie/card-selfie.component';
import { IgmService } from './_services/igm.service';
import { HttpClientModule } from '@angular/common/http';
import { LandingPageComponent } from './landing-page/landing-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FormComponent,
    HomeComponent,
    ProfileComponent,
    IdBookComponent,
    IdCardComponent,
    ProofOfResidenceComponent,
    LivelinessComponent,
    IDDocumentComponent,
    FrontComponent,
    BackComponent,
    BookSelfieComponent,
    CardSelfieComponent,
    InsideComponent,
    LandingPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [IgmService],
  bootstrap: [AppComponent],
})
export class AppModule { }
