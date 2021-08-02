import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { IdBookComponent } from './profile/id-document/card/id-book/id-book.component';
import { InsideComponent } from './profile/id-document/card/id-book/uploads/inside/inside.component';
import { BookSelfieComponent } from './profile/id-document/card/id-book/uploads/selfie/book-selfie.component';
import { IdCardComponent } from './profile/id-document/card/id-card/id-card.component';
import { BackComponent } from './profile/id-document/card/id-card/uploads/back/back.component';
import { FrontComponent } from './profile/id-document/card/id-card/uploads/front/front.component';
import { CardSelfieComponent } from './profile/id-document/card/id-card/uploads/selfie/card-selfie.component';
import { IDDocumentComponent } from './profile/id-document/id-document.component';
import { LivelinessComponent } from './profile/liveliness/liveliness.component';
import { ProfileComponent } from './profile/profile.component';
import { ProofOfResidenceComponent } from './profile/proof-of-residence/proof-of-residence.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent, children: [
      // {
      //   path: '',
      //   component: LandingPageComponent,
      // },
      {
        path: '',
        component: ProfileComponent,
      },
      {
        path: 'id-documentation',
        component: IDDocumentComponent,
      },
      {
        path: 'id-documentation/id-card',
        component: IdCardComponent,
      },

      {
        path: 'id-documentation/id-card/front',
        component: FrontComponent,
      },
      {
        path: 'id-documentation/id-card/back',
        component: BackComponent,
      },
      {
        path: 'id-documentation/id-card/selfie',
        component: CardSelfieComponent,
      },
      {
        path: 'id-documentation/id-book',
        component: IdBookComponent,
      },
      {
        path: 'id-documentation/id-book/inside',
        component: InsideComponent,
      },
      {
        path: 'id-documentation/id-book/selfie',
        component: BookSelfieComponent,
      },
      {
        path: 'proof-of-residence',
        component: ProofOfResidenceComponent,
      },
      {
        path: 'liveliness',
        component: LivelinessComponent,
      },
    ]
  },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
