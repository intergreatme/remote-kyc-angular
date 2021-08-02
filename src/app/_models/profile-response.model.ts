import { Address } from "./address.model";
import { ShareStatusEnum } from "./share-status.enum";
import { UserDocument } from "./user-document.model";

export class ProfileResponse {
  id: string;
  unique_field: string;
  document_number: string;
  passport_country: string;
  use_passport: boolean;
  first_name: string;
  last_name: string;
  email_address: string;
  documents: UserDocument[]; // Collecton of documents, POR, ID Card, etc.
  share_status: ShareStatusEnum; //NONE, INCOMPLETE, CONSENT, COMPLETE, TIMEOUT
  share_success: boolean;
  liveliness_state: string; //NONE, FAIL, PASS
  origin_tx_id: string;
  address: Address;
  constructor(
    origin_tx_id: string,
    id: string,
    unique_field: string,
    document_number: string,
    passport_country: string,
    use_passport: boolean,
    first_name: string,
    last_name: string,
    email_address: string,
    documents: UserDocument[],
    share_status: ShareStatusEnum,
    share_success: boolean,
    liveliness_state: string,
    address: Address
    ) {
      this.origin_tx_id = origin_tx_id;
      this.id = id;
      this.unique_field = unique_field;
      this.document_number = document_number;
      this.passport_country = passport_country;
      this.use_passport = use_passport;
      this.first_name = first_name;
      this.last_name = last_name;
      this.email_address = email_address;
      this.documents = documents;
      this.share_status = share_status;
      this.share_success = share_success;
      this.liveliness_state = liveliness_state;
      this.address = address;
  }
}
