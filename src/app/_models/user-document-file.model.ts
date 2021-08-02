import { UserDocumentFileMessage } from "./user-document-file-message.model";

export class UserDocumentFile {
  file_type: string;
  created_on: number;
  message: UserDocumentFileMessage;
}
