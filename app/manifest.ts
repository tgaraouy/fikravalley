import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Fikra Valley',
        short_name: 'Fikra',
        description: 'Men l\'Fikra l Machroû3 - De l\'idée au projet',
        start_url: '/',
        display: 'standalone',
        background_color: '#fdfcfb',
        theme_color: '#e0e7ff',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
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
