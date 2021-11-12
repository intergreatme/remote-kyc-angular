import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './_helpers/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { IdCardComponent } from './profile/id-document/card/id-card/id-card.component';
import { IdBookComponent } from './profile/id-document/card/id-book/id-book.component';
import { ProofOfResidenceComponent } from './profile/proof-of-residence/proof-of-residence.component';
import { IDDocumentComponent } from './profile/id-document/id-document.component';
import { IgmService } from './_services/igm.service';
import { HttpClientModule } from '@angular/common/http';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SafePipe } from './_services/safe.pipe';
import { CompleteComponent } from './end-pages/complete/complete.component';
import { CompleteErrorComponent } from './end-pages/complete-error/complete-error.component';
import { CompletePassComponent } from './end-pages/complete-pass/complete-pass.component';
import { TimeoutComponent } from './end-pages/timeout/timeout.component';

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    IdBookComponent,
    IdCardComponent,
    ProofOfResidenceComponent,
    IDDocumentComponent,
    LandingPageComponent,
    SafePipe,
    CompleteComponent,
    CompleteErrorComponent,
    CompletePassComponent,
    TimeoutComponent,
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
