import { ResponseWrapperCodeEnum } from "./response-wrapper-code.enum";

export class ResponseWrapper<T> {
  code: ResponseWrapperCodeEnum;
  data: T;
}
