import { UserDocumentFile } from "./user-document-file.model";

export class UserDocument {
  created_on: number;
  doc_type: string;
  files: UserDocumentFile[];
  status: string;
  delayed: boolean;
}
