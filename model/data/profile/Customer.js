import mongoose from 'mongoose';
import Profile from './Profile.js';

const customerSchema = new mongoose.Schema({

});

const Customer = Profile.discriminator('Customer', customerSchema);

export default Customer;