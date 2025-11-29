import { MetadataRoute } from 'next';
import { APP_TAGLINE } from '@/lib/constants/tagline';

export default function manifest(): MetadataRoute.Manifest {
    return {
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
}
