import mongoose from 'mongoose';
import regex from "../../util/regex.js"
import Profile from "../data/profile/Profile.js"
import Admin from "../data/profile/Admin.js"
import Customer from '../data/profile/Customer.js';
import Driver from '../data/profile/Driver.js';

const ACCOUNT_TYPE = ['Admin', 'Customer', 'Driver'];

const accountSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true, 
        index: true,
        required: [true, 'Required'],
        match: [regex.usernameRegex, 'Invalid']
    },

    password: {
        type: String,
        required: [true, 'Required'],
        minlength: [8, 'Too short'],
    },

    accountType: {
        type: String,
        required: [true, 'Required'],
        validate: {
            validator: (v) => {
                return ACCOUNT_TYPE.includes(v);
            },
            message: "Invalid"
        }
    },

    profile:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
    },

    joinDate: {
        type: Date,
        default: Date.now(),
        immutable: true
    }
})

accountSchema.methods.verifyAccount = function(username, password) {
    return this.username === username && this.password === password;
}

accountSchema.statics.createAccount = async function(info) {
    if (!info.accountType || !ACCOUNT_TYPE.includes(info.accountType)) {
        await new this(info).validate();
    }
    const account = new this(info);
    const profile = new mongoose.model(info.accountType)(info);
    account.profile = profile._id;
    await profile.save();
    return await account.save().catch(async err => {
        await profile.deleteOne();
        throw err;
    });
}

accountSchema.methods.deleteAccount = async function() {
    const profile = await Profile.findById(this.profile);
    await profile.deleteProfile();
    await this.deleteOne();
}

const model = mongoose.model('Account', accountSchema);
export default model;