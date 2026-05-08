import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.facebook.appId') || 'unconfigured',
      clientSecret: configService.get<string>('oauth.facebook.appSecret') || 'unconfigured',
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'email', 'name', 'photos'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value,
      fullName: name.givenName + ' ' + name.familyName,
      avatarUrl: photos?.[0]?.value,
      provider: 'facebook',
    };
    done(null, user);
  }
}
