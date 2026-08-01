import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_financial_hub';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

function cleanEmoji(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Standard emojis
    .replace(/[\u{2600}-\u{27BF}]/gu, '') // Miscellaneous Symbols & Dingbats
    .replace(/[\u{1F000}-\u{1F0FF}]/gu, '')
    .trim();
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('Successfully connected to MongoDB');
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    
    // Perform database migration to strip category emojis
    const db = cached!.conn.connection.db;
    if (db) {
      const txCollection = db.collection('financial_transactions');
      const txs = await txCollection.find({}).toArray();
      for (const tx of txs) {
        if (tx.category) {
          const clean = cleanEmoji(tx.category);
          if (clean !== tx.category) {
            await txCollection.updateOne({ _id: tx._id }, { $set: { category: clean } });
          }
        }
      }

      const budgetCollection = db.collection('budgets');
      const budgets = await budgetCollection.find({}).toArray();
      for (const b of budgets) {
        if (b.category) {
          const clean = cleanEmoji(b.category);
          if (clean !== b.category) {
            try {
              await budgetCollection.updateOne({ _id: b._id }, { $set: { category: clean } });
            } catch (e) {
              await budgetCollection.deleteOne({ _id: b._id });
            }
          }
        }
      }

      const recurringCollection = db.collection('financial_recurring_transactions');
      const recurrings = await recurringCollection.find({}).toArray();
      for (const rec of recurrings) {
        if (rec.category) {
          const clean = cleanEmoji(rec.category);
          if (clean !== rec.category) {
            await recurringCollection.updateOne({ _id: rec._id }, { $set: { category: clean } });
          }
        }
      }

      // Rename old categories to match new aligned categories
      const CATEGORY_MIGRATION_MAP: Record<string, string> = {
        'Ăn uống': 'Ăn uống & Cà phê',
        'Cà phê & Đi chợ': 'Đi chợ & Siêu thị',
        'Học tập': 'Giáo dục & Học tập',
        'Khác': 'Chi phí khác',
        'Lương / Thưởng': 'Lương & Thưởng',
        'Lương thưởng': 'Lương & Thưởng',
        'Thu nhập phụ': 'Kinh doanh & Làm thêm',
        'Kinh doanh': 'Kinh doanh & Làm thêm',
        'Cho thuê': 'Đầu tư & Lãi suất',
        'Cổ tức': 'Đầu tư & Lãi suất',
        'Tiền thuê nhà': 'Nhà cửa & Tiền thuê',
        'Nhà cửa': 'Nhà cửa & Tiền thuê',
        'Di chuyển': 'Di chuyển & Xăng xe',
        'Mua sắm': 'Mua sắm & Quần áo',
        'Sức khỏe': 'Y tế & Sức khỏe',
        'Bảo hiểm': 'Y tế & Sức khỏe',
        'Điện/Nước/Internet': 'Hóa đơn & Tiện ích',
        'Học phí': 'Giáo dục & Học tập',
        'Trả góp vay': 'Khoản nợ & Lãi suất',
        'Giải trí': 'Giải trí & Du lịch'
      };

      for (const [oldCat, newCat] of Object.entries(CATEGORY_MIGRATION_MAP)) {
        await txCollection.updateMany({ category: oldCat }, { $set: { category: newCat } });
        await budgetCollection.updateMany({ category: oldCat }, { $set: { category: newCat } });
        await recurringCollection.updateMany({ category: oldCat }, { $set: { category: newCat } });
      }
    }
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
