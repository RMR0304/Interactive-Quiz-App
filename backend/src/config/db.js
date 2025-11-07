import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz_app';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
  console.log('MongoDB connected');
  return mongoose.connection;
};



