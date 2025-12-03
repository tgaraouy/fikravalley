/**
 * LinkedIn OAuth Integration
 * 
 * Handles LinkedIn OAuth 2.0 flow for mentor registration
 */

export interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

export interface LinkedInProfile {
  id: string;
  firstName: {
    localized: { [key: string]: string };
    preferredLocale: { language: string; country: string };
  };
  lastName: {
    localized: { [key: string]: string };
    preferredLocale: { language: string; country: string };
  };
  profilePicture?: {
    displayImage: string;
  };
  headline?: string;
  location?: {
    country: string;
    geographicArea?: string;
  };
  positions?: {
    elements: Array<{
      title: string;
      companyName: string;
      timePeriod: {
        startDate?: { year: number; month?: number };
        endDate?: { year: number; month?: number };
      };
    }>;
  };
  skills?: {
    elements: Array<{
      name: string;
    }>;
  };
  summary?: string;
}

/**
 * Check if LinkedIn OAuth is configured
 */
export function isLinkedInConfigured(): boolean {
  return !!process.env.LINKEDIN_CLIENT_ID && !!process.env.LINKEDIN_CLIENT_SECRET;
}

/**
 * Get LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(state: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;
  
  if (!clientId) {
    throw new Error('LINKEDIN_CLIENT_ID environment variable is required. LinkedIn OAuth is not configured.');
  }

  // LinkedIn OpenID Connect scopes (simpler, more reliable)
  const scopes = [
    'openid', // OpenID Connect
    'profile', // Basic profile
    'email', // Email address
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: scopes,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables are required');
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Fetch LinkedIn profile using access token
 * Uses OpenID Connect userinfo endpoint (simpler, more reliable)
 */
export async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  // Try OpenID Connect userinfo endpoint first (simpler)
  try {
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (userinfoResponse.ok) {
      const userinfo = await userinfoResponse.json();
      
      // Map userinfo to LinkedInProfile format
      const profile: LinkedInProfile = {
        id: userinfo.sub || userinfo.id || '',
        firstName: {
          localized: { [userinfo.locale || 'en_US']: userinfo.given_name || '' },
          preferredLocale: { language: 'en', country: 'US' },
        },
        lastName: {
          localized: { [userinfo.locale || 'en_US']: userinfo.family_name || '' },
          preferredLocale: { language: 'en', country: 'US' },
        },
        headline: userinfo.name || userinfo.given_name + ' ' + userinfo.family_name,
        location: userinfo.locale ? { country: userinfo.locale.split('_')[1] || 'US' } : undefined,
      };

      // Try to fetch additional data from v2 API
      try {
        const v2Response = await fetch('https://api.linkedin.com/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        });

        if (v2Response.ok) {
          const v2Data = await v2Response.json();
          if (v2Data.headline) profile.headline = v2Data.headline;
          if (v2Data.location) profile.location = v2Data.location;
        }
      } catch (v2Error) {
        // v2 API is optional
        if (process.env.NODE_ENV === 'development') {
          console.warn('Could not fetch LinkedIn v2 data:', v2Error);
        }
      }

      return profile;
    }
  } catch (userinfoError) {
    // Fallback to v2 API
    if (process.env.NODE_ENV === 'development') {
      console.warn('userinfo endpoint failed, trying v2 API:', userinfoError);
    }
  }

  // Fallback: Try v2 API
  const profileFields = [
    'id',
    'firstName',
    'lastName',
    'profilePicture(displayImage~:playableStreams)',
    'headline',
    'location',
  ].join(',');

  const v2Response = await fetch(
    `https://api.linkedin.com/v2/me?projection=(${profileFields})`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  );

  if (!v2Response.ok) {
    const error = await v2Response.text();
    throw new Error(`LinkedIn profile fetch failed: ${error}`);
  }

  const profile = await v2Response.json();

  // Try to fetch positions (optional)
  try {
    const positionsResponse = await fetch(
      `https://api.linkedin.com/v2/positions?q=members&projection=(elements*(title,companyName,timePeriod))`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (positionsResponse.ok) {
      const positionsData = await positionsResponse.json();
      profile.positions = positionsData;
    }
  } catch (error) {
    // Positions are optional
    if (process.env.NODE_ENV === 'development') {
      console.warn('Could not fetch LinkedIn positions:', error);
    }
  }

  // Try to fetch skills (optional)
  try {
    const skillsResponse = await fetch(
      `https://api.linkedin.com/v2/skills?q=members&projection=(elements*(name))`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (skillsResponse.ok) {
      const skillsData = await skillsResponse.json();
      profile.skills = skillsData;
    }
  } catch (error) {
    // Skills are optional
    if (process.env.NODE_ENV === 'development') {
      console.warn('Could not fetch LinkedIn skills:', error);
    }
  }

  return profile;
}

/**
 * Generate random state for OAuth security
 */
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

