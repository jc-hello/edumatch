import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    // Use placeholders when creds aren't configured — POST /auth/oauth uses
    // google-auth-library directly, this strategy is only needed for the
    // redirect-based flow which is opt-in.
    super({
      clientID: configService.get<string>('oauth.google.clientId') || 'unconfigured',
      clientSecret: configService.get<string>('oauth.google.clientSecret') || 'unconfigured',
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      fullName: name.givenName + ' ' + name.familyName,
      avatarUrl: photos[0]?.value,
      provider: 'google',
    };
    done(null, user);
  }
}
