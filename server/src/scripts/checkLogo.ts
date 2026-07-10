import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Company from '../models/Company.js';

const checkLogo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    const companies = await Company.find({});
    console.log('--- Companies in Database ---');
    companies.forEach(c => {
      console.log(`Name: ${c.name}, Slug: ${c.slug}, Logo: "${c.logo}"`);
    });
    console.log('-----------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkLogo();
