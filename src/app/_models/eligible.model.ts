
export class Eligible{
  eligible: boolean;
  shareID: string; //UUID
  completeState: string; // INCOMPLETE, CONSENT, COMPLETE, TIMEOUT
  authToken: string;

  constructor(eligible: boolean, shareID: string, completeState: string, authToken: string) {
    this.eligible = eligible;
    this.shareID = shareID;
    this.completeState = completeState;
    this.authToken = authToken;
  }
}
