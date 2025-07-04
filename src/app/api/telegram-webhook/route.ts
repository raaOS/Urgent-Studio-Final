'use server';
import {NextRequest, NextResponse} from 'next/server';
import {db, isFirebaseConfigured} from '@/lib/firebase';
import {collection, query, where, getDocs, doc, updateDoc, limit, runTransaction} from 'firebase/firestore';
import { getOrderByCode } from '@/services/orderService';
import { addRefund } from '@/services/refundService';
import { summarizeDesignBrief } from '@/ai/flows/summarize-design-brief';
import type { OrderStatus, OrderItem, Order, Brief } from '@/lib/types';
import { sendMessage, sendPhoto, editMessageText, answerCallbackQuery, deleteMessage, editMessageReplyMarkup } from '@/services/telegramService';

// --- Konfigurasi ---
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

// Rate limiting untuk mencegah spam
const userLastAction = new Map<string, number>();
const RATE_LIMIT_MS = 1000; // 1 detik cooldown

// --- Utility Functions ---
function isRateLimited(chatId: string): boolean {
  const lastAction = userLastAction.get(chatId) || 0;
  const now = Date.now();
  if (now - lastAction < RATE_LIMIT_MS) {
    return true;
  }
  userLastAction.set(chatId, now);
  return false;
}

function validateEnvironmentVariables(): string | null {
  const requiredEnvVars = [
    { name: 'TELEGRAM_BOT_TOKEN', value: process.env.TELEGRAM_BOT_TOKEN },
    { name: 'TELEGRAM_WEBHOOK_SECRET', value: WEBHOOK_SECRET },
    { name: 'OWNER_CHAT_ID', value: OWNER_CHAT_ID }
  ];

  for (const envVar of requiredEnvVars) {
    if (!envVar.value) {
      return `Missing required environment variable: ${envVar.name}`;
    }
  }
  return null;
}

async function safeFirebaseOperation<T>(
  operation: () => Promise<T>, 
  errorContext: string
): Promise<T | null> {
  if (!db) {
      console.error(`Firebase operation failed [${errorContext}]: Database not configured.`);
      return null;
  }
  try {
    return await operation();
  } catch (error) {
    console.error(`Firebase operation failed [${errorContext}]:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes('failed-precondition')) {
        console.error('Missing Firestore index. Please create composite index in Firebase Console');
      } else if (error.message.includes('permission-denied')) {
        console.error('Firestore permission denied. Check security rules');
      } else if (error.message.includes('unavailable')) {
        console.error('Firestore temporarily unavailable. Retrying might help');
      }
    }
    
    return null;
  }
}

// --- Logika Utama Webhook ---
export async function POST(request: NextRequest) {
  console.log('---[ Webhook Received ]---');
  
  const envError = validateEnvironmentVariables();
  if (envError) {
    console.error('!!! [CRITICAL CONFIG ERROR] !!!:', envError);
    return NextResponse.json({error: 'Server configuration error'}, {status: 500});
  }

  if (!isFirebaseConfigured || !db) {
    console.error('!!! [Webhook Error] !!!: Firebase is not configured. Cannot process Telegram updates.');
    return NextResponse.json({status: 'ok - firebase not configured'});
  }

  try {
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    console.log('Verifying secret token...');
    
    if (secretToken !== WEBHOOK_SECRET) {
      console.error('Webhook secret token mismatch!');
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }
    console.log('Secret token verified.');

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({error: 'Invalid request body'}, {status: 400});
    }

    console.log('Webhook body:', JSON.stringify(body, null, 2));
    
    if (body.callback_query) {
      console.log('Handling callback_query...');
      await handleCallbackQuery(body.callback_query);
    } else if (body.message) {
      console.log('Handling message...');
      await handleMessage(body.message);
    } else {
      console.log('Received an update type that is not handled (e.g., channel_post).');
    }

    console.log('---[ Webhook Processed Successfully ]---');
    return NextResponse.json({status: 'ok'});

  } catch (error) {
    console.error('!!![ Error processing Telegram webhook ]!!!:', error);
    
    if (OWNER_CHAT_ID) {
      try {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await sendMessage(OWNER_CHAT_ID, `❗️ *Bot Error* \nTerjadi kesalahan pada webhook: ${errorMessage}\n\nSilakan periksa log server untuk detailnya.`);
      } catch (notificationError) {
        console.error('Failed to send error notification to owner:', notificationError);
      }
    }
    
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}

// --- Handler untuk Pesan Teks & Foto ---
async function handleMessage(message: any) {
  if (!message || !message.chat) {
    console.error('Invalid message structure received');
    return;
  }

  const chatId = Number(message.chat.id);
  const text = message.text;
  const photo = message.photo;

  if (isRateLimited(String(chatId))) {
    console.log(`Rate limited for chat ${chatId}`);
    try {
      await sendMessage(chatId, 'Mohon tunggu sebentar sebelum mengirim pesan lagi.');
    } catch (error) {
      console.error('Failed to send rate limit message:', error);
    }
    return;
  }

  if (!db) {
    console.error("Database not initialized in handleMessage");
    return;
  }
  
  const ordersRef = collection(db, 'orders');

  if (text && text.startsWith('/brief') && String(chatId) === OWNER_CHAT_ID) {
    console.log(`Handling /brief command from owner...`);
    const orderCode = text.split(' ')[1];
    
    if (!orderCode) {
      await sendMessage(chatId, 'Gunakan format: `/brief [Kode Order]`\nContoh: `/brief ORD-12345`');
      return;
    }
    
    await sendMessage(chatId, `Menganalisis brief untuk pesanan *${orderCode}*... ⏳`);

    try {
      const order = await getOrderByCode(orderCode.trim());
      
      if (!order) {
        await sendMessage(chatId, `❗️ Pesanan dengan kode *${orderCode}* tidak ditemukan.`);
        return;
      }

      const allBriefs: Brief[] = order.items.flatMap(item => item.briefs || []);
      
      if (allBriefs.length === 0) {
        await sendMessage(chatId, `Pesanan *${orderCode}* tidak memiliki brief atau catatan revisi untuk diringkas.`);
        return;
      }

      allBriefs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const latestBrief = allBriefs[0];

      if (!latestBrief.content) {
        await sendMessage(chatId, `Catatan terakhir untuk pesanan *${orderCode}* kosong.`);
        return;
      }
      
      const { summary } = await summarizeDesignBrief({ designBrief: latestBrief.content });
      
      const summaryMessage = `*Ringkasan AI untuk ${orderCode} (dari catatan terbaru)* 📝\n\n${summary}`;
      await sendMessage(chatId, summaryMessage);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server AI.";
      console.error("Error during AI summary:", error);
      await sendMessage(chatId, `❗️ Gagal membuat ringkasan AI untuk *${orderCode}*.\n*Error:* ${errorMessage}`);
    }
  
  } else if (text && text.startsWith('/start')) {
    const orderCode = text.substring('/start'.length).trim();
    
    console.log(`Handling /start command for order code: ${orderCode}`);
    if (!orderCode) {
      await sendMessage(chatId, 'Selamat datang! Mohon gunakan link konfirmasi dari halaman checkout untuk memulai.');
      return;
    }

    try {
      const order = await getOrderByCode(orderCode);

      if (!order || !order.id) {
        console.log(`Order with code ${orderCode} not found.`);
        await sendMessage(chatId, `Maaf, pesanan dengan kode *${orderCode}* tidak ditemukan.`);
        return;
      }
      
      console.log(`Order ${orderCode} found. Updating document...`);
      
      const result = await safeFirebaseOperation(
        () => runTransaction(db, async (transaction) => {
          const orderRef = doc(db, "orders", order.id as string);
          transaction.update(orderRef, { 
            telegramChatId: chatId, 
            status: 'Menunggu Pembayaran',
            updatedAt: new Date(),
          });
        }),
        `updating order ${orderCode} with chat ID`
      );

      if (result === null) {
        await sendMessage(chatId, 'Terjadi kesalahan saat memproses pesanan. Mohon coba lagi atau hubungi admin.');
        return;
      }

      console.log(`Document updated with chatId: ${chatId}`);

      const itemsText = order.items.map((item: OrderItem) => 
        `- ${item.name} (*${item.budgetTier}*) - Rp${item.price.toLocaleString('id-ID')}`
      ).join('\n');

      let discountText = '';
      if (order.couponDiscount && order.couponDiscount > 0) {
        discountText = `\n- Diskon: *-Rp${order.couponDiscount.toLocaleString('id-ID')}*`;
      }

      const orderDetails = `*Pesanan Diterima: ${orderCode}*\n\nTerima kasih, ${order.customerName}! Berikut rincian pesanan Anda:\n${itemsText}\n\n- Total: *Rp${order.totalAmount.toLocaleString('id-ID')}*${discountText}`;
      const paymentInstructions = `Silakan lakukan pembayaran melalui salah satu metode berikut:\n\n*BCA:* 1234567890 (a.n. Urgent Studio)\n*Gopay/QRIS:* (Link atau gambar QRIS Anda di sini)\n\nSetelah melakukan pembayaran, mohon *kirimkan bukti transfer (screenshot)* ke chat ini.`;
      
      await sendMessage(chatId, `${orderDetails}\n\n---\n\n${paymentInstructions}`);

    } catch (error) {
      console.error('Error in /start command:', error);
      await sendMessage(chatId, 'Terjadi kesalahan sistem. Mohon coba lagi atau hubungi admin.');
    }

  } else if (photo) {
    console.log(`Handling photo message from chat ID: ${chatId}`);
    
    if (!Array.isArray(photo) || photo.length === 0) {
      await sendMessage(chatId, 'Foto tidak dapat diproses. Mohon kirim ulang bukti pembayaran.');
      return;
    }

    const q = query(
      ordersRef, 
      where("telegramChatId", "==", chatId), 
      where("status", "==", "Menunggu Pembayaran"), 
      limit(1)
    );
    
    const querySnapshot = await safeFirebaseOperation(
      () => getDocs(q),
      `querying orders for payment proof from chat ${chatId}`
    );

    if (!querySnapshot || querySnapshot.empty) {
      console.log(`No order waiting for payment found for chat ID: ${chatId}`);
      await sendMessage(chatId, `Maaf, kami tidak menemukan pesanan yang sedang menunggu pembayaran dari Anda. Jika ada kendala, silakan hubungi admin.`);
      return;
    }

    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data();
    const orderCode = orderData.orderCode;
    console.log(`Found order ${orderCode} waiting for payment. Processing proof...`);
    
    const updateResult = await safeFirebaseOperation(
      () => updateDoc(doc(db, "orders", orderDoc.id), { 
        status: 'Menunggu Konfirmasi', 
        updatedAt: new Date() 
      }),
      `updating order ${orderCode} to waiting confirmation`
    );

    if (updateResult === null) {
      await sendMessage(chatId, 'Terjadi kesalahan saat memproses bukti pembayaran. Mohon coba lagi.');
      return;
    }
    
    await sendMessage(chatId, `Terima kasih! Bukti pembayaran Anda untuk pesanan *${orderCode}* sedang kami periksa. Mohon tunggu konfirmasi selanjutnya ya.`);

    if (OWNER_CHAT_ID) {
      try {
        console.log(`Forwarding payment proof to owner: ${OWNER_CHAT_ID}`);
        const photoFileId = photo[photo.length - 1].file_id;
        const caption = `💰 *Konfirmasi Pembayaran*\n\nPesanan: *${orderCode}*\nPelanggan: ${orderData.customerName}\nTotal: Rp${orderData.totalAmount.toLocaleString('id-ID')}\n\nHarap konfirmasi jika pembayaran sudah diterima.`;
        const keyboard = {
          inline_keyboard: [[
            { text: '✅ Konfirmasi', callback_data: `confirm_${orderCode}` },
            { text: '❌ Tolak', callback_data: `reject_${orderCode}` }
          ]]
        };
        await sendPhoto(OWNER_CHAT_ID, photoFileId, caption, { reply_markup: JSON.stringify(keyboard) });
      } catch (error) {
        console.error('Failed to forward payment proof to owner:', error);
      }
    }
  
  } else if (text) {
    const revisionQuery = query(
      ordersRef, 
      where("telegramChatId", "==", chatId), 
      where("status", "==", "Menunggu Input Revisi"), 
      limit(1)
    );
    
    const revisionSnapshot = await safeFirebaseOperation(
      () => getDocs(revisionQuery),
      `querying revision orders for chat ${chatId}`
    );

    if (revisionSnapshot && !revisionSnapshot.empty) {
      const orderDoc = revisionSnapshot.docs[0];
      const orderId = orderDoc.id;
      const currentOrder = await getOrderByCode(orderDoc.data().orderCode);
      
      if (!currentOrder) {
        await sendMessage(chatId, 'Terjadi kesalahan saat mengakses data pesanan. Mohon hubungi admin.');
        return;
      }
      
      const newBrief: Brief = {
        content: text,
        timestamp: new Date(),
        revisionNumber: (currentOrder.revisionCount || 0),
      };

      const itemsToUpdate = currentOrder.items.map(item => {
        if (item.itemStatus === 'Revisi') {
          return {
            ...item,
            briefs: [...(item.briefs || []), newBrief],
            itemStatus: 'Dalam Pengerjaan' as const,
          };
        }
        return item;
      });

      const nextStatus: OrderStatus = 'Dalam Pengerjaan';

      const updateResult = await safeFirebaseOperation(
        () => updateDoc(doc(db, "orders", orderId), { 
          status: nextStatus,
          items: itemsToUpdate,
          updatedAt: new Date(),
        }),
        `updating order ${currentOrder.orderCode} with revision notes`
      );

      if (updateResult === null) {
        await sendMessage(chatId, 'Terjadi kesalahan saat menyimpan catatan revisi. Mohon coba lagi.');
        return;
      }

      await sendMessage(chatId, `Catatan revisi Anda untuk pesanan *${currentOrder.orderCode}* telah kami terima dan akan segera dikerjakan oleh desainer.`);
      
      if (OWNER_CHAT_ID) {
        try {
          await sendMessage(OWNER_CHAT_ID, `📝 *Revisi Diterima*\n\nPesanan: *${currentOrder.orderCode}*\nPelanggan: ${currentOrder.customerName}\n\n*Catatan Revisi:*\n${text}`);
        } catch (error) {
          console.error('Failed to notify owner about revision:', error);
        }
      }
    } else {
      const anyActiveOrderQuery = query(
        ordersRef, 
        where("telegramChatId", "==", chatId),
        where("isCancelled", "!=", true),
        where("status", "!=", "Selesai"),
        limit(1)
      );
      
      const activeOrderSnapshot = await safeFirebaseOperation(
        () => getDocs(anyActiveOrderQuery),
        `querying active orders for chat ${chatId}`
      );

      if (activeOrderSnapshot && !activeOrderSnapshot.empty) {
        const activeOrder = activeOrderSnapshot.docs[0].data();
        if (activeOrder.status === 'Menunggu Respon Klien') {
          await sendMessage(chatId, "Untuk melanjutkan, mohon gunakan tombol pilihan (ACC/Revisi) yang telah kami kirimkan di atas ya.");
        } else if (activeOrder.status === 'G-Meet Terjadwal') {
          await sendMessage(chatId, "Mohon maaf, jatah revisi melalui teks sudah habis. Admin kami akan menghubungi Anda untuk penjadwalan. Mohon ditunggu ya.");
        } else {
          await sendMessage(chatId, `Maaf, saya tidak mengerti pesan Anda. Untuk pesanan *${activeOrder.orderCode}*, mohon gunakan tombol interaktif yang telah kami sediakan. Jika mengalami kendala, silakan hubungi admin.`);
        }
      } else {
        await sendMessage(chatId, "Halo! Jika Anda butuh bantuan atau ingin mengonfirmasi pesanan baru, silakan gunakan link dari website setelah checkout.");
      }
    }
  }
}

// --- Handler untuk Klik Tombol Inline ---
async function handleCallbackQuery(callbackQuery: any) {
  if (!db) {
    console.error("Database not initialized in handleCallbackQuery");
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (!callbackQuery || !callbackQuery.message || !callbackQuery.data) {
    console.error("Invalid callback query structure");
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  const message = callbackQuery.message;
  const fromChatId = Number(message.chat.id);
  const messageId = message.message_id;
  const data = callbackQuery.data;
  
  const dataParts = data.split('_');
  if (dataParts.length < 2) {
    console.error('Invalid callback data format:', data);
    await answerCallbackQuery(callbackQuery.id);
    return;
  }
  
  const [action, orderCode, itemIndexStr] = dataParts;

  if (isRateLimited(String(fromChatId))) {
    await answerCallbackQuery(callbackQuery.id, 'Mohon tunggu sebentar...');
    return;
  }

  try {
    await answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error('Failed to answer callback query:', error);
  }

  const order = await getOrderByCode(orderCode);
  if (!order || !order.id) {
    console.error(`Callback error: Order ${orderCode} not found.`);
    try {
      await editMessageText(fromChatId, messageId, `Error: Pesanan ${orderCode} tidak ditemukan.`);
    } catch (error) {
      console.error('Failed to edit message with error:', error);
    }
    return;
  }
  
  const customerChatId = order.telegramChatId;
  
  if (String(fromChatId) === OWNER_CHAT_ID) {
    const originalCaption = message.caption || '';
    
    if (action === 'confirm') {
      console.log(`Confirming payment for ${orderCode}.`);
      
      const updateResult = await safeFirebaseOperation(
        () => updateDoc(doc(db, "orders", order.id as string), { 
          status: 'Menunggu Antrian',
          amountPaid: order.totalAmount,
          updatedAt: new Date(),
        }),
        `confirming payment for order ${orderCode}`
      );

      if (updateResult === null) {
        await editMessageText(fromChatId, messageId, `${originalCaption}\n\n--- *Status: ❌ Gagal dikonfirmasi (error sistem)* ---`, { reply_markup: null });
        return;
      }
      
      await editMessageText(fromChatId, messageId, `${originalCaption}\n\n--- *Status: ✅ Dikonfirmasi* ---`, { reply_markup: null });
      
      if (customerChatId) {
        try {
          const confirmationText = `🎉 *Pembayaran Dikonfirmasi!*\n\nPesanan Anda *${orderCode}* telah kami terima dan sekarang masuk dalam antrian desain. Tim kami akan segera menghubungi Anda jika ada update.`;
          await sendMessage(customerChatId, confirmationText);
        } catch (error) {
          console.error('Failed to send confirmation to customer:', error);
        }
      }

    } else if (action === 'reject') {
      console.log(`Rejecting payment for ${orderCode}.`);
      
      const updateResult = await safeFirebaseOperation(
        () => updateDoc(doc(db, "orders", order.id as string), { 
          status: 'Menunggu Pembayaran', 
          updatedAt: new Date() 
        }),
        `rejecting payment for order ${orderCode}`
      );

      if (updateResult === null) {
        await editMessageText(fromChatId, messageId, `${originalCaption}\n\n--- *Status: ❌ Gagal ditolak (error sistem)* ---`, { reply_markup: null });
        return;
      }
      
      await editMessageText(fromChatId, messageId, `${originalCaption}\n\n--- *Status: ❌ Ditolak* ---`, { reply_markup: null });
      
      if (customerChatId) {
        try {
          const rejectionText = `❗️ *Pembayaran Ditolak*\n\nMohon maaf, terjadi masalah dengan konfirmasi pembayaran untuk pesanan *${orderCode}*. Silakan kirim ulang bukti transfer yang valid atau hubungi admin untuk informasi lebih lanjut.`;
          await sendMessage(customerChatId, rejectionText);
        } catch (error) {
          console.error('Failed to send rejection to customer:', error);
        }
      }
    }
    
  } else if (customerChatId && fromChatId === customerChatId) {
    
    if (action === 'approve') {
      const updateResult = await safeFirebaseOperation(
        () => updateDoc(doc(db, "orders", order.id as string), { 
          status: 'Selesai',
          items: order.items.map(item => ({ ...item, itemStatus: 'Disetujui' })),
          updatedAt: new Date(),
        }),
        `approving order ${orderCode}`
      );

      if (updateResult === null) {
        await editMessageText(fromChatId, messageId, "❌ Terjadi kesalahan saat menyetujui desain. Mohon coba lagi.");
        return;
      }

      await editMessageText(fromChatId, messageId, "✅ Desain telah Anda setujui.");
      await sendMessage(fromChatId, `Terima kasih atas konfirmasinya! Pesanan *${orderCode}* telah selesai. Berikut adalah link Google Drive untuk mengunduh semua file Anda:\n\n${order.driveFolderUrl || '(Link akan diberikan admin secara manual)'}`);
    
    } else if (action === 'revision') {
      const itemsNeedingReview = order.items.filter(item => item.itemStatus !== 'Disetujui');
      const maxRevisionLimit = Math.max(...itemsNeedingReview.map(item => {
        if (item.budgetTier === 'Kaki Lima') return 1;
        if (item.budgetTier === 'UMKM') return 2;
        return 3;
      }));
      const currentRevisionCount = order.revisionCount || 0;

      if (currentRevisionCount >= maxRevisionLimit) {
        await safeFirebaseOperation(
          () => updateDoc(doc(db, "orders", order.id as string), { 
            status: 'G-Meet Terjadwal', 
            updatedAt: new Date() 
          }),
          `scheduling gmeet for order ${orderCode}`
        );

        await editMessageText(fromChatId, messageId, "Anda telah mencapai batas revisi via teks.");
        const gmeetCustomerMessage = `Karena sudah mencapai batas revisi, kami mengundang Anda untuk sesi revisi langsung via Google Meet agar lebih efektif. *Admin kami akan segera menghubungi Anda secara pribadi di chat ini untuk mengatur jadwal.* Mohon ditunggu ya.`;
        await sendMessage(fromChatId, gmeetCustomerMessage);

        if (OWNER_CHAT_ID) {
          await sendMessage(OWNER_CHAT_ID, `❗️ *Perlu Penjadwalan G-Meet*\n\nPesanan *${order.orderCode}* (${order.customerName}) telah mencapai batas revisi. Harap segera hubungi pelanggan untuk mengatur jadwal G-Meet.`);
        }
      } else {
        const nextRevisionNumber = currentRevisionCount + 1;
        const updatedItems = order.items.map(item =>
          item.itemStatus !== 'Disetujui' ? { ...item, itemStatus: 'Menunggu Respon Klien' as const } : item
        );
        
        await safeFirebaseOperation(
          () => updateDoc(doc(db, "orders", order.id as string), { 
            revisionCount: nextRevisionNumber,
            items: updatedItems,
            updatedAt: new Date(),
          }),
          `starting revision for order ${orderCode}`
        );
        
        await editMessageText(fromChatId, messageId, "✍️ Permintaan revisi diterima. Mari kita ulas setiap item.");
        
        const finalOrderState = await getOrderByCode(orderCode);
        if (finalOrderState) {
          await askAboutNextItem(finalOrderState, fromChatId, messageId);
        }
      }
      
    } else if (action === 'itemacc' || action === 'itemrev') {
      const itemIndex = parseInt(itemIndexStr, 10);
      
      if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= order.items.length) {
        await editMessageText(fromChatId, messageId, "❌ Item tidak valid. Mohon mulai ulang proses.");
        return;
      }

      const updatedItems = [...order.items];
      updatedItems[itemIndex].itemStatus = action === 'itemacc' ? 'Disetujui' : 'Revisi';

      await safeFirebaseOperation(
        () => updateDoc(doc(db, "orders", order.id as string), { items: updatedItems, updatedAt: new Date() }),
        `updating item status for order ${orderCode}, item ${itemIndex}`
      );
      
      const updatedOrder = await getOrderByCode(orderCode);
      if (updatedOrder) {
        await askAboutNextItem(updatedOrder, fromChatId, messageId);
      }

    } else if (action === 'confirmrev') {
      await deleteMessage(fromChatId, messageId);

      await safeFirebaseOperation(
        () => updateDoc(doc(db, "orders", order.id as string), { status: 'Menunggu Input Revisi', updatedAt: new Date() }),
        `setting order ${orderCode} to 'Menunggu Input Revisi'`
      );

      const revisionInstruction = `❗️ *PERHATIAN, INI PENTING* ❗️\n\nJatah revisi Anda berlaku per *PUTARAN*, bukan per item.\n\nHarap tuliskan *SEMUA POIN REVISI* untuk item yang telah Anda tandai dalam *SATU PESAN SEKALIGUS*.\n\nSebutkan nama itemnya agar jelas, contoh:\n"LOGO: ganti warna jadi biru. KARTU NAMA: nomor teleponnya salah."\n\n---\n*PENTING:* Item yang tidak Anda sebutkan dalam pesan revisi ini akan *OTOMATIS KAMI ANGGAP DISETUJUI (ACC)* dan *TIDAK DAPAT DIREVISI LAGI* di putaran berikutnya.`;
      await sendMessage(fromChatId, revisionInstruction);
      
    } else if (action === 'cancelrev') {
      const resetItems = order.items.map(item =>
        item.itemStatus !== 'Disetujui' ? { ...item, itemStatus: 'Menunggu Respon Klien' as const } : item
      );
      
      await safeFirebaseOperation(
        () => updateDoc(doc(db, "orders", order.id as string), { items: resetItems, updatedAt: new Date() }),
        `resetting revision choices for order ${orderCode}`
      );
      
      const updatedOrder = await getOrderByCode(orderCode);
      if (updatedOrder) {
        await askAboutNextItem(updatedOrder, fromChatId, messageId);
      }
      
    } else if (action === 'cancel') {
      const preDesignStatuses: OrderStatus[] = ['Menunggu Antrian', 'Dalam Pengerjaan'];
      const isPreDesign = preDesignStatuses.includes(order.status);
      
      let newStatus: OrderStatus;
      let refundReason = '';
      let customerMessage = '';
      let finalRefundAmount = 0;

      if (isPreDesign) {
        const penaltyPercentage = 0.10;
        const penaltyAmount = order.totalAmount * penaltyPercentage;
        refundReason = `Dibatalkan oleh pelanggan sebelum desain dikirim (potongan biaya administrasi ${penaltyPercentage * 100}% dari total tagihan).`;
        
        if (order.paymentMethod === 'LUNAS') {
            newStatus = 'Dibatalkan (Refund Pra-Lunas)';
            finalRefundAmount = Math.max(0, order.totalAmount - penaltyAmount);
        } else {
            newStatus = 'Dibatalkan (Refund Pra-DP)';
            finalRefundAmount = Math.max(0, order.amountPaid - penaltyAmount);
        }
        customerMessage = `Kami telah menerima permintaan pembatalan Anda untuk pesanan *${order.orderCode}*.\n\nSesuai kebijakan, pembatalan pra-desain dikenakan *biaya administrasi 10% dari total tagihan*.\n\nAdmin kami akan segera menghubungi Anda untuk memproses pengembalian dana sebesar *Rp${finalRefundAmount.toLocaleString('id-ID')}*.`;

      } else {
        if (order.paymentMethod === 'LUNAS') {
            newStatus = 'Dibatalkan (Refund Pasca-Lunas)';
            const penaltyPercentage = 0.50;
            const penaltyAmount = order.totalAmount * penaltyPercentage;
            finalRefundAmount = Math.max(0, order.totalAmount - penaltyAmount);
            refundReason = `Dibatalkan oleh pelanggan setelah desain dikirim (potongan biaya pengerjaan ${penaltyPercentage * 100}% dari total tagihan).`;
            customerMessage = `Kami telah menerima permintaan pembatalan Anda untuk pesanan *${order.orderCode}*.\n\nSesuai kebijakan, karena desain telah dikirim, dikenakan *potongan biaya pengerjaan 50% dari total tagihan*.\n\nAdmin kami akan segera menghubungi Anda untuk memproses pengembalian dana sebesar *Rp${finalRefundAmount.toLocaleString('id-ID')}*.`;
        } else {
            newStatus = 'Dibatalkan (Refund Pasca-DP)';
            const penaltyAmount = order.totalAmount * 0.50; 
            finalRefundAmount = Math.max(0, order.amountPaid - penaltyAmount);
            
            if (finalRefundAmount > 0) {
                refundReason = `Dibatalkan oleh pelanggan setelah desain dikirim (potongan 50% dari total tagihan). Sebagian DP dikembalikan.`;
                customerMessage = `Kami telah menerima permintaan pembatalan Anda untuk pesanan *${order.orderCode}*.\n\nSesuai kebijakan, karena desain telah dikirim, dikenakan *potongan biaya pengerjaan 50% dari total tagihan*. Admin kami akan menghubungi Anda untuk memproses pengembalian dana sebesar *Rp${finalRefundAmount.toLocaleString('id-ID')}* dari DP yang telah Anda bayarkan.`;
            } else {
                refundReason = `Dibatalkan oleh pelanggan setelah desain dikirim (DP hangus untuk menutupi biaya pengerjaan).`;
                customerMessage = `Kami telah menerima permintaan pembatalan Anda untuk pesanan *${order.orderCode}*.\n\nSesuai kebijakan, karena desain telah dikirim, seluruh DP Anda (Rp${order.amountPaid.toLocaleString('id-ID')}) digunakan untuk menutupi biaya pengerjaan yang telah dilakukan. Tidak ada pengembalian dana yang dapat diproses.`;
            }
        }
      }
      
      if (finalRefundAmount > 0) {
        await safeFirebaseOperation(
          () => addRefund({
              orderCode: order.orderCode,
              refundAmount: finalRefundAmount,
              reason: refundReason,
              processedBy: 'System Bot',
              processedAt: new Date()
          }),
          `adding refund record for order ${order.orderCode}`
        );
      }

      await safeFirebaseOperation(
        () => updateDoc(doc(db, "orders", order.id as string), { 
            status: newStatus, 
            updatedAt: new Date(),
            isCancelled: true 
        }),
        `cancelling order ${order.orderCode}`
      );

      await editMessageText(fromChatId, messageId, "❌ Pesanan telah dibatalkan.");
      await sendMessage(fromChatId, customerMessage);
      
      if (OWNER_CHAT_ID) {
          const ownerMessage = `❗️ *Permintaan Pembatalan & Refund*\n\nPelanggan *${order.customerName}* (${order.customerTelegram}) telah membatalkan pesanan *${order.orderCode}*.\n\n*Status Order:* ${newStatus}\n*Alasan:* ${refundReason}\n*Total Refund:* *Rp${finalRefundAmount.toLocaleString('id-ID')}*\n\nMohon segera proses pengembalian dana (jika ada) dan konfirmasi ke pelanggan.`;
          await sendMessage(OWNER_CHAT_ID, ownerMessage);
      }
    }
  }
}

async function askAboutNextItem(order: Order, chatId: number | string, messageId: number) {
  if (!order.id || !db) {
    console.error("askAboutNextItem called with an order that has no ID or db is not available.");
    return;
  }

  const nextItemIndex = order.items.findIndex(item => item.itemStatus === 'Menunggu Respon Klien');

  if (nextItemIndex === -1) {
    await showRevisionConfirmation(order, chatId, messageId);
    return;
  }

  const item = order.items[nextItemIndex];
  const text = `*Item ${nextItemIndex + 1} dari ${order.items.length}: ${item.name}*\n\nApa yang ingin Anda lakukan dengan item ini?`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: `✅ ACC`, callback_data: `itemacc_${order.orderCode}_${nextItemIndex}` },
        { text: `✍️ Revisi`, callback_data: `itemrev_${order.orderCode}_${nextItemIndex}` }
      ],
      [
        { text: `❌ Batalkan Seluruh Pesanan`, callback_data: `cancel_${order.orderCode}` }
      ]
    ]
  };
  
  try {
    await editMessageText(chatId, messageId, text);
    await editMessageReplyMarkup(chatId, messageId, keyboard);
  } catch (error) {
    console.error('Failed to ask about next item:', error);
  }
}

async function showRevisionConfirmation(order: Order, chatId: number | string, messageId: number) {
  if (!order.id || !db) {
    console.error("showRevisionConfirmation called with an order that has no ID or db is not available.");
    if (OWNER_CHAT_ID) {
      await sendMessage(OWNER_CHAT_ID, `Bot Error: Attempted to process a revision confirmation for an order without an ID (${order.orderCode}).`);
    }
    return;
  }

  const itemsToRevise = order.items.filter(item => item.itemStatus === 'Revisi');
  const itemsToAcc = order.items.filter(item => item.itemStatus === 'Disetujui');

  if (itemsToRevise.length === 0) {
    await safeFirebaseOperation(
      () => updateDoc(doc(db, "orders", order.id as string), { 
        status: 'Selesai',
        items: order.items.map(item => ({ ...item, itemStatus: 'Disetujui' })),
        updatedAt: new Date(),
      }),
      `marking order ${order.orderCode} as 'Selesai' after all items approved`
    );
    
    await editMessageText(chatId, messageId, "Semua item telah Anda setujui. Terima kasih! Pesanan Anda kini telah selesai.");
    await sendMessage(chatId, `Berikut adalah link Google Drive untuk mengunduh semua file Anda:\n\n${order.driveFolderUrl || '(Link akan diberikan admin secara manual)'}`);
    return;
  }

  let confirmationText = "*Konfirmasi Pilihan Revisi Anda*\n\n";
  confirmationText += "Harap pastikan pilihan Anda sudah benar. Item yang sudah di-ACC tidak dapat diubah kembali.\n\n";
  
  if (itemsToRevise.length > 0) {
    confirmationText += "*✍️ Akan Direvisi:*\n";
    itemsToRevise.forEach(item => {
      confirmationText += `- ${item.name}\n`;
    });
  }
  
  if (itemsToAcc.length > 0) {
    confirmationText += "\n*✅ Telah Disetujui (Final):*\n";
    itemsToAcc.forEach(item => {
      confirmationText += `- ${item.name}\n`;
    });
  }

  const keyboard = {
    inline_keyboard: [[
      { text: '✅ Ya, Benar & Lanjutkan', callback_data: `confirmrev_${order.orderCode}` },
      { text: '❌ Ulangi Pilihan', callback_data: `cancelrev_${order.orderCode}` }
    ]]
  };

  try {
    await editMessageText(chatId, messageId, confirmationText);
    await editMessageReplyMarkup(chatId, messageId, keyboard);
  } catch(error) {
    console.error('Failed to show revision confirmation:', error);
  }
}
