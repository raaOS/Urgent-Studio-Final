'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Order, OrderStatus } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
  type DocumentData,
  limit,
  getCountFromServer,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { startOfWeek, endOfWeek, differenceInDays, subHours } from 'date-fns';
import { sendMessage, sendPhotoToClient } from '@/services/telegramService';


// Helper to convert Firestore doc to Order
function toOrder(docData: DocumentData): Order {
  const data = docData.data();
  return {
    id: docData.id,
    orderCode: data.orderCode,
    customerName: data.customerName,
    customerTelegram: data.customerTelegram,
    customerPhone: data.customerPhone,
    telegramChatId: data.telegramChatId,
    items: data.items ? data.items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      itemStatus: item.itemStatus || 'Dalam Pengerjaan',
      budgetTier: item.budgetTier || 'Kaki Lima',
      briefs: item.briefs ? item.briefs.map((b: any) => ({ ...b, timestamp: (b.timestamp as Timestamp).toDate() })) : [],
      revisionCount: item.revisionCount || 0,
      driveLink: item.driveLink,
      dimensions: item.dimensions,
    })) : [],
    totalAmount: data.totalAmount,
    amountPaid: data.amountPaid,
    paymentMethod: data.paymentMethod,
    status: data.status,
    queue: data.queue,
    revisionCount: data.revisionCount || 0,
    driveFolderUrl: data.driveFolderUrl,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || (data.createdAt as Timestamp)?.toDate() || new Date(),
    couponCode: data.couponCode,
    couponDiscount: data.couponDiscount,
    isCancelled: data.isCancelled ?? false,
    lastReminderSentAt: data.lastReminderSentAt ? (data.lastReminderSentAt as Timestamp).toDate() : undefined,
  };
}


// Creates a new order in Firestore
export async function createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const ordersCollection = collection(db, 'orders');
    
    const dataToSave = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCancelled: false,
    };

    const docRef = await addDoc(ordersCollection, dataToSave);
    return docRef.id;
  } catch (error) {
    console.warn("Firebase Warning: Gagal membuat pesanan:", error);
    throw new Error("Gagal menyimpan pesanan ke database.");
  }
}

// Fetches all orders from Firestore
export async function getOrders(): Promise<Order[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
        const ordersCollection = collection(db, "orders");
        const orderSnapshot = await getDocs(ordersCollection);
        return orderSnapshot.docs.map(toOrder);
    } catch (error) {
        console.warn("Firebase Warning: Gagal mengambil pesanan:", error);
        // Mengembalikan array kosong jika gagal, agar halaman tidak crash.
        return [];
    }
}


// Fetches a single order by its unique orderCode
export async function getOrderByCode(orderCode: string): Promise<Order | null> {
    if (!isFirebaseConfigured || !db) return null;
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where("orderCode", "==", orderCode), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }
        
        return toOrder(querySnapshot.docs[0]);

    } catch (error) {
        console.warn(`Firebase Warning: Gagal mengambil pesanan dengan kode ${orderCode}:`, error);
        throw new Error("Gagal mengambil data pesanan.");
    }
}

// Updates an existing order in Firestore
export async function updateOrder(id: string, orderUpdate: Partial<Omit<Order, 'id'>>): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
    try {
        const orderDoc = doc(db, "orders", id);
        // Firestore cannot store undefined values.
        const updateData: { [key: string]: any } = { ...orderUpdate, updatedAt: new Date() };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        
        await updateDoc(orderDoc, updateData);
    } catch (error) {
        console.warn(`Firebase Warning: Gagal memperbarui pesanan ${id}:`, error);
        throw new Error("Gagal memperbarui status pesanan di database.");
    }
}

// Fetches only the count of orders within the current week for quota calculation.
export async function getWeeklyOrderCount(): Promise<number> {
  if (!isFirebaseConfigured || !db) return 0;
  try {
    const now = new Date();
    // Use { weekStartsOn: 1 } for Monday
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const ordersCollection = collection(db, 'orders');
    const q = query(
      ordersCollection,
      where('createdAt', '>=', Timestamp.fromDate(weekStart)),
      where('createdAt', '<=', Timestamp.fromDate(weekEnd)),
      where('isCancelled', '==', false)
    );
    
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;

  } catch (error) {
    console.warn(`Firebase Warning: Gagal menghitung pesanan mingguan: ${JSON.stringify(error, null, 2)}`);
    // Return 0 on error to avoid breaking quota logic
    return 0;
  }
}

// Server action to send a draft to the client via Telegram
export async function sendDraftToClient(orderId: string, fileId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");

    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
        throw new Error("Pesanan tidak ditemukan.");
    }

    const order = toOrder(orderSnap);
    const customerChatId = order.telegramChatId;

    if (!customerChatId) {
        throw new Error("ID Chat Telegram pelanggan tidak ditemukan.");
    }

    const caption = `Halo Kak ${order.customerName}! Ini draf desain untuk pesanan *${order.orderCode}*. Silakan diperiksa ya.`;
    const keyboard = {
        inline_keyboard: [[
            { text: '✅ Setuju & Selesai', callback_data: `approve_${order.orderCode}` },
            { text: '✍️ Minta Revisi', callback_data: `revision_${order.orderCode}` },
            { text: '❌ Batalkan Pesanan', callback_data: `cancel_${order.orderCode}` }
        ]]
    };

    try {
        await sendPhotoToClient(customerChatId, fileId, caption, keyboard);
        // Set all items to 'Menunggu Respon Klien'
        const updatedItems = order.items.map(item => ({ ...item, itemStatus: 'Menunggu Respon Klien' as const }));
        await updateDoc(orderRef, { status: 'Menunggu Respon Klien', items: updatedItems, updatedAt: new Date() });
    } catch (error) {
        console.error("Gagal mengirim draf ke klien atau memperbarui status:", error);
        throw new Error("Terjadi kesalahan saat berkomunikasi dengan Telegram atau database.");
    }
}


// Server action to send reminders to all stalled orders.
export async function sendRemindersToStalledOrders(): Promise<{ success: boolean; remindersSent: number, error?: string }> {
  if (!isFirebaseConfigured || !db) {
    return { success: false, remindersSent: 0, error: "Firebase tidak terkonfigurasi." };
  }

  const STALE_ORDER_THRESHOLD_DAYS = 3;
  const AT_RISK_STATUSES: OrderStatus[] = [
    'Menunggu Pembayaran', 'Menunggu Konfirmasi', 'Menunggu Respon Klien', 
    'Menunggu Input Revisi', 'G-Meet Terjadwal'
  ];

  try {
    const allOrders = await getOrders();
    const now = new Date();
    const twentyFourHoursAgo = subHours(now, 24);

    const stalledOrdersToRemind = allOrders.filter(order => {
      const daysSinceUpdate = differenceInDays(now, new Date(order.updatedAt));
      const needsReminder = AT_RISK_STATUSES.includes(order.status) && daysSinceUpdate >= STALE_ORDER_THRESHOLD_DAYS;
      
      // Check if a reminder was sent recently
      const reminderSentRecently = order.lastReminderSentAt && new Date(order.lastReminderSentAt) > twentyFourHoursAgo;

      return needsReminder && !order.isCancelled && !reminderSentRecently;
    });

    if (stalledOrdersToRemind.length === 0) {
      return { success: true, remindersSent: 0 };
    }

    const batch = writeBatch(db);
    let remindersSentCount = 0;

    for (const order of stalledOrdersToRemind) {
        if (order.id && order.telegramChatId) {
            const reminderMessage = `Halo Kak ${order.customerName}, kami hanya ingin menginformasikan bahwa pesanan Anda *${order.orderCode}* masih menunggu respon dari Anda. Jika ada kendala, jangan ragu untuk menghubungi admin ya. Terima kasih!`;
            
            // Send message via Telegram
            await sendMessage(order.telegramChatId, reminderMessage);

            // Update the order in the batch
            const orderRef = doc(db, 'orders', order.id);
            batch.update(orderRef, { lastReminderSentAt: new Date() });
            remindersSentCount++;
        }
    }

    // Commit all updates at once
    await batch.commit();

    return { success: true, remindersSent: remindersSentCount };

  } catch (error) {
    console.error("Gagal mengirim pengingat massal:", error);
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui.";
    return { success: false, remindersSent: 0, error: message };
  }
}
