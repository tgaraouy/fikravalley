/**
 * Public Manifest Route Handler
 * 
 * Explicitly handles /manifest.webmanifest requests
 * Ensures it's publicly accessible (no auth required)
 * This route bypasses any authentication middleware
 */

import { NextResponse } from 'next/server';
import { APP_TAGLINE } from '@/lib/constants/tagline';

export async function GET() {
  const manifest = {
    name: `Fikra Valley - ${APP_TAGLINE.main.fr.headline}`,
    short_name: 'Fikra Valley',
    description: APP_TAGLINE.meta.fr,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/png/FikraValley_flag_logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/png/FikraValley_flag_logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['business', 'productivity', 'education'],
    shortcuts: [
      {
        name: 'Soumettre une idée',
        short_name: 'Soumettre',
        description: 'Enregistre ton idée avec ta voix',
        url: '/submit-voice',
        icons: [{ src: '/png/FikraValley_flag_logo.png', sizes: '96x96' }],
      },
      {
        name: 'Voir les idées',
        short_name: 'Idées',
        description: 'Parcourir les projets existants',
        url: '/ideas',
        icons: [{ src: '/png/FikraValley_flag_logo.png', sizes: '96x96' }],
      },
    ],
    share_target: {
      action: '/api/import-voice',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [
          {
            name: 'voice',
            accept: ['audio/*']
          }
        ]
      }
    }
  };

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Ensure this route is publicly accessible and cached
export const dynamic = 'force-static';
export const revalidate = 3600;

