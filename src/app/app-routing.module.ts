import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CompleteErrorComponent } from './end-pages/complete-error/complete-error.component';
import { CompletePassComponent } from './end-pages/complete-pass/complete-pass.component';
import { CompleteComponent } from './end-pages/complete/complete.component';
import { TimeoutComponent } from './end-pages/timeout/timeout.component';
import { IdBookComponent } from './profile/id-document/card/id-book/id-book.component';
import { IdCardComponent } from './profile/id-document/card/id-card/id-card.component';
import { IDDocumentComponent } from './profile/id-document/id-document.component';
import { ProfileComponent } from './profile/profile.component';
import { ProofOfResidenceComponent } from './profile/proof-of-residence/proof-of-residence.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent, children: [
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
        path: 'id-documentation/id-book',
        component: IdBookComponent,
      },
      {
        path: 'proof-of-residence',
        component: ProofOfResidenceComponent,
      },
      {
        path: 'end',
        component: CompleteComponent,
      },
      {
        path: 'error',
        component: CompleteErrorComponent,
      },
      {
        path: 'timeout',
        component: TimeoutComponent,
      },
      {
        path: 'success',
        component: CompletePassComponent,
      },
    ]
  },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
