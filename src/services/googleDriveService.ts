
'use server';

import { google } from 'googleapis';

const requiredEnvVars = [
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_DRIVE_FOLDER_ID'
];

function getGoogleAuth() {
    // Memvalidasi variabel environment
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
        throw new Error(`Variabel environment berikut belum diatur: ${missingVars.join(', ')}`);
    }

    // Memformat private key yang mungkin memiliki karakter escape
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

    return new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
}

export async function testGoogleDriveConnection(): Promise<{ success: boolean; message: string }> {
    try {
        const auth = getGoogleAuth();
        const drive = google.drive({ version: 'v3', auth });
        
        // Operasi sederhana untuk mengetes koneksi: mencoba mendapatkan metadata folder utama.
        // Ini adalah operasi read-only yang aman.
        await drive.files.get({
            fileId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
            fields: 'id, name', // Hanya meminta informasi dasar
        });

        return {
            success: true,
            message: 'Koneksi ke Google Drive berhasil! Sistem siap membuat folder otomatis.',
        };

    } catch (error: any) {
        console.error('Google Drive connection test failed:', error);

        let errorMessage = 'Terjadi kesalahan yang tidak diketahui.';
        if (error.message) {
            errorMessage = error.message;
        }
        if (error.response?.data?.error_description) {
           errorMessage = error.response.data.error_description;
        } else if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        }

        return {
            success: false,
            message: `Gagal terhubung: ${errorMessage}. Pastikan semua langkah di panduan sudah diikuti dengan benar, terutama langkah membagikan folder ke client_email.`,
        };
    }
}
