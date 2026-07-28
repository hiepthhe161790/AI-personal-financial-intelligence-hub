const fs = require('fs');
const mongoose = require('mongoose');

let uri = 'mongodb://127.0.0.1:27017/ai_financial_hub';
try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    if (line.startsWith('MONGODB_URI=')) {
      uri = line.substring('MONGODB_URI='.length).trim();
      break;
    }
  }
} catch (e) {
  console.log('Failed to read .env file', e);
}

console.log('Using MONGODB_URI:', uri);

async function run() {
  await mongoose.connect(uri);
  console.log('Connected to DB');

  const budgetSchema = new mongoose.Schema({}, { strict: false });
  const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema, 'budgets');

  const items = await Budget.find({});
  console.log('Budgets in DB:', JSON.stringify(items, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
