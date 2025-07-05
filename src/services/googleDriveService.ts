
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
        const errorDetails = missingVars.map(v => {
            if (v === 'GOOGLE_CLIENT_EMAIL') return `- ${v}: Salin nilai "client_email" dari file JSON Anda.`;
            if (v === 'GOOGLE_PRIVATE_KEY') return `- ${v}: Salin seluruh "private_key" (termasuk "-----BEGIN..." dan "-----END...") dari file JSON Anda.`;
            if (v === 'GOOGLE_DRIVE_FOLDER_ID') return `- ${v}: Salin ID dari URL folder utama di Google Drive Anda.`;
            return `- ${v}`;
        }).join('\n');
        throw new Error(`Beberapa variabel environment penting belum diatur. Mohon periksa file .env atau pengaturan environment di Vercel Anda:\n\n${errorDetails}`);
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
        const response = await drive.files.get({
            fileId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
            fields: 'id, name', // Hanya meminta informasi dasar
        });

        const folderName = response.data.name;

        return {
            success: true,
            message: `Koneksi ke Google Drive berhasil! Sistem terhubung ke folder utama Anda: "${folderName}".`,
        };

    } catch (error: any) {
        console.error('Google Drive connection test failed:', error);

        let detailedErrorMessage = '';
        if (error.message.includes('variabel environment penting belum diatur')) {
            // Error dari validasi internal kita
            detailedErrorMessage = error.message;
        } else if (error.code === 404) {
             detailedErrorMessage = `Folder dengan ID '${process.env.GOOGLE_DRIVE_FOLDER_ID}' tidak ditemukan. Pastikan GOOGLE_DRIVE_FOLDER_ID sudah benar dan tidak ada salah ketik.`;
        } else if (error.code === 403 || (error.message && error.message.toLowerCase().includes('permission'))) {
             detailedErrorMessage = `Izin ditolak. Pastikan Anda sudah membagikan (share) folder utama di Google Drive ke "client_email" (${process.env.GOOGLE_CLIENT_EMAIL || 'EMAIL BELUM DIATUR'}) dengan akses sebagai "Editor". Ini adalah langkah yang paling sering terlewat.`;
        } else {
            // Error umum lainnya
            detailedErrorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui.';
        }

        return {
            success: false,
            message: `Gagal terhubung.\n\n${detailedErrorMessage}`,
        };
    }
}
