import mongoose from 'mongoose';
import Profile from './Profile.js';

const adminSchema = new mongoose.Schema({
    adminID: {
        type: String,
        required: [true, 'Required'],
        index: true,
        unique: true
    }
});

const Admin = Profile.discriminator('Admin', adminSchema);

export default Admin;