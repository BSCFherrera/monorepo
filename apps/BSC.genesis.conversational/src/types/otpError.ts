import {OtpErrorCode} from '@/types/index';

export class OtpApiError extends Error {
  code: OtpErrorCode;

  constructor(code: OtpErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
