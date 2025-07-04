
'use server';

// --- Konfigurasi ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// --- Fungsi Helper untuk Berinteraksi dengan API Telegram ---

/**
 * Mengirim pesan teks ke chat tertentu.
 */
export async function sendMessage(chatId: number | string, text: string, options: object = {}) {
  const url = `${TELEGRAM_API}/sendMessage`;
  console.log(`Sending message to ${chatId}...`);
  try {
    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chat_id: chatId, text, parse_mode: 'Markdown', ...options}),
    });
    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Telegram API Error (sendMessage): ${errorData.description}`);
    } else {
        console.log(`Message sent successfully to ${chatId}.`);
    }
  } catch(error) {
    console.error(`Failed to send message to ${chatId}:`, error);
  }
}

/**
 * Mengirim foto (dengan file_id) beserta caption dan keyboard inline.
 */
export async function sendPhoto(chatId: number | string, photoFileId: string, caption: string, options: object = {}) {
    const url = `${TELEGRAM_API}/sendPhoto`;
    console.log(`Sending photo to ${chatId}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ chat_id: chatId, photo: photoFileId, caption, parse_mode: 'Markdown', ...options }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Telegram API Error (sendPhoto): ${errorData.description}`);
        } else {
            console.log(`Photo sent successfully to ${chatId}.`);
        }
    } catch(error) {
        console.error(`Failed to send photo to ${chatId}:`, error);
    }
}

/**
 * Mengedit teks dari pesan yang sudah ada (misal: menghapus tombol setelah diklik).
 */
export async function editMessageText(chatId: number | string, messageId: number, text: string, options: object = {}) {
    await fetch(`${TELEGRAM_API}/editMessageText`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: 'Markdown', ...options }),
    });
}

/**
 * Mengedit hanya keyboard inline dari pesan yang sudah ada.
 */
export async function editMessageReplyMarkup(chatId: number | string, messageId: number, replyMarkup: object) {
  const url = `${TELEGRAM_API}/editMessageReplyMarkup`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: JSON.stringify(replyMarkup),
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Telegram API Error (editMessageReplyMarkup): ${errorData.description}`);
    }
  } catch (error) {
    console.error(`Failed to edit message reply markup for message ${messageId} in chat ${chatId}:`, error);
  }
}

/**
 * Memberi tahu Telegram bahwa sebuah callback query sudah diproses.
 */
export async function answerCallbackQuery(callbackQueryId: string, options?: { text?: string; show_alert?: boolean }) {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ callback_query_id: callbackQueryId, ...options }),
    });
}

/**
 * Menghapus pesan dari chat.
 */
export async function deleteMessage(chatId: number | string, messageId: number) {
  try {
    await fetch(`${TELEGRAM_API}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    });
  } catch(error) {
    console.error(`Failed to delete message ${messageId} in chat ${chatId}:`, error);
  }
}

// Helper to send a photo with a caption and keyboard via Telegram API.
// This will be called from a server action triggered by the designer panel.
export async function sendPhotoToClient(chatId: number | string, fileId: string, caption: string, keyboard: object) {
  await sendPhoto(chatId, fileId, caption, { reply_markup: JSON.stringify(keyboard) });
}

    