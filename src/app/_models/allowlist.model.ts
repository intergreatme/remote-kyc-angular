
export class Allowlist {
  uniqueFieldID: string;
  txID: string;
  orginTxID: string;

  constructor(
    uniqueFieldID: string,
    txID: string,
    orginTxID: string
    ) {
      this.uniqueFieldID = uniqueFieldID;
      this.txID = txID;
      this.orginTxID = orginTxID;
    }
}
