import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Fikra Valley - Morocco\'s Valley of Ideas',
        short_name: 'Fikra Valley',
        description: 'Where Moroccan ideas grow. Transform your ideas into businesses with 7 AI agents.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        orientation: 'portrait-primary',
        icons: [
            {
                src: '/fikra_logo_v3.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/fikra_logo_v3.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],
        categories: ['business', 'productivity', 'education'],
        shortcuts: [
            {
                name: 'Soumettre une idée',
                short_name: 'Soumettre',
                description: 'Enregistre ton idée avec ta voix',
                url: '/submit-voice',
                icons: [{ src: '/fikra_logo_v3.png', sizes: '96x96' }],
            },
            {
                name: 'Voir les idées',
                short_name: 'Idées',
                description: 'Parcourir les projets existants',
                url: '/ideas',
                icons: [{ src: '/fikra_logo_v3.png', sizes: '96x96' }],
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
