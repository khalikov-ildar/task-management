import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
  setCookie(res: Response, token: string, payload: string) {
    res.cookie(token, payload, {
      secure: true,
      httpOnly: true,
    });
  }

  clearCookie(res: Response, token: string) {
    res.clearCookie(token);
  }
}
