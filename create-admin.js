require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const passwordHash = await bcrypt.hash('admin123', 10);

  await User.deleteOne({ email: 'admin@greenroute.com' });

  await User.create({
    name: 'Admin',
    email: 'admin@greenroute.com',
    passwordHash,
    role: 'admin',
    accountStatus: 'active',
  });

  console.log('Admin created — email: admin@greenroute.com / password: admin123');
  process.exit();
}

createAdmin().catch(err => { console.error(err); process.exit(1); });