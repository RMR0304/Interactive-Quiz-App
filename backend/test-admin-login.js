// Quick test script to verify admin login
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';

dotenv.config();

const testAdminLogin = async () => {
  try {
    await connectDB();
    console.log('\n=== Testing Admin Login ===\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Run: npm run seed');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Has Password: ${!!admin.password}`);
    console.log(`   Password Hash: ${admin.password.substring(0, 20)}...`);

    // Test password comparison
    console.log('\n=== Testing Password Comparison ===\n');
    const testPassword = 'password123';
    const match = await admin.comparePassword(testPassword);
    
    if (match) {
      console.log('✅ Password comparison successful!');
      console.log(`   Password "${testPassword}" matches`);
    } else {
      console.log('❌ Password comparison failed!');
      console.log(`   Password "${testPassword}" does NOT match`);
    }

    // Check all users
    console.log('\n=== All Users in Database ===\n');
    const allUsers = await User.find({}).select('name email role');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Test complete!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testAdminLogin();

