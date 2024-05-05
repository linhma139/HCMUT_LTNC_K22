import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Required'],
        ref: 'Driver',
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Required'],
        ref: 'Customer',
    },

    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Required'],
        ref: 'Order',
    },

    comment: {
        type: String,
        required: [true, 'Required'],
        minlength: [1, 'Too short'],
        maxlength: [1000, 'Too long']
    },

    rating: {
        type: Number,
        required: [true, 'Required'],
        min: [0, 'Invalid'],
        max: [5, 'Invalid']
    },
});

const model = mongoose.model('Review', reviewSchema);
export default model;