import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('voice') as File | null;

        if (!file) {
            return NextResponse.redirect(new URL('/submit-voice?error=no_file', request.url));
        }

        // Convert file to Base64 to embed in the response
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = file.type || 'audio/mpeg'; // Default to mp3/mpeg if unknown

        // Return an HTML page that saves the file to IndexedDB and redirects
        // We use a simple script that mimics the logic in lib/voice/offline-storage.ts
        // but simplified for this "bridge" page.
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Importing Voice Note...</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fdfcfb; color: #333; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #e0e7ff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <h2>Jib Fikra... (Importation)</h2>
          <p>Kan-sajjlo l'audio dyalk...</p>
          
          <script>
            async function saveAndRedirect() {
              try {
                // 1. Convert Base64 back to Blob
                const base64 = "${base64}";
                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "${mimeType}" });
                
                // 2. Open IndexedDB (mimicking lib/voice/offline-storage.ts)
                const DB_NAME = 'FikraVoiceDB';
                const STORE_NAME = 'voice_drafts';
                const DB_VERSION = 1;
                
                const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);
                
                dbRequest.onupgradeneeded = (event) => {
                  const db = event.target.result;
                  if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                  }
                };
                
                dbRequest.onsuccess = (event) => {
                  const db = event.target.result;
                  const transaction = db.transaction(STORE_NAME, 'readwrite');
                  const store = transaction.objectStore(STORE_NAME);
                  
                  // Create a draft ID
                  const userId = 'user_' + Date.now();
                  const draft = {
                    id: userId,
                    transcript: '', // Will be transcribed on the page
                    audioBlob: blob,
                    timestamp: Date.now(),
                    language: 'fr-MA', // Default
                    importedFrom: 'whatsapp'
                  };
                  
                  const putRequest = store.put(draft);
                  
                  putRequest.onsuccess = () => {
                    // 3. Redirect to submission page
                    // We pass the userId so the page knows which draft to load
                    window.location.href = '/submit-voice?draftId=' + userId + '&autoStart=true';
                  };
                  
                  putRequest.onerror = (e) => {
                    console.error('Error saving:', e);
                    alert('Erreur de sauvegarde. Réessayez.');
                    window.location.href = '/submit-voice';
                  };
                };
                
              } catch (e) {
                console.error('Import error:', e);
                window.location.href = '/submit-voice?error=import_failed';
              }
            }
            
            saveAndRedirect();
          </script>
        </body>
      </html>
    `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        console.error('Error handling voice import:', error);
        return NextResponse.redirect(new URL('/submit-voice?error=server_error', request.url));
    }
}
