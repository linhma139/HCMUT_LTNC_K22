import mongoose from 'mongoose';
import regex from "../../../util/regex.js"


const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Required'],
        match: [regex.nameRegex, 'Invalid']
    },

    email: {
        type: String,
        required: [true, 'Required'],
        match: [regex.emailRegex, 'Invalid']
    },

    phoneNumber: {
        type: String,
        unique: true,
        index: true,
        required: [true, 'Required'],
        match: [regex.phoneRegex, 'Invalid']
    }
});

profileSchema.methods.deleteProfile = async function() {
    await this.deleteOne();
}

const model = mongoose.model('Profile', profileSchema);
export default model;