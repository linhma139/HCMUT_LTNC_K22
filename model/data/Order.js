import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    addtionalAddress: {
        type: String,
    },

    street: {
        type: String,
        required: [true, 'Required']
    },

    city: {
        type: String,
        required: [true, 'Required']
    }, 

    province: {
        type: String,
        required: [true, 'Required']
    },
    
    country: {
        type: String,
        default: 'Việt Nam'
    }
})

const orderSchema = new mongoose.Schema({
    locationFrom:
    {
        type: locationSchema,
        required: [true, 'Required']
    },

    locationTo:
    {
        type: locationSchema,
        required: [true, 'Required']
    },

    createdOn: {
        type: Date,
        default: Date.now(),
        immutable: true
    },

    timeFrom: {
        type: Date,
        required: [true, 'Required'],
        default: Date.now(),
    },

    timeTo: {
        type: Date,
        required: [true, 'Required']
    },

    customer:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Required']
    },

    driver:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
    },

    vehicle:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
    },

    distance: {
        type: Number,
        required: [true, 'Required'],
    },

    price:
    {
        type: Number,
        default: 0,
        required: [true, 'Required'],
    },

    canceled:
    {
        type: Boolean,
        default: false,
    },
});

orderSchema.methods.cannotCancel = function() {
    return this.timeFrom < Date.now() || this.canceled;
}

orderSchema.methods.cannotReview = function() {
    return this.timeFrom > Date.now() || this.canceled;
}

orderSchema.methods.cancelOrder = async function() {
    if (!this.cannotCancel) return false;
    this.canceled = true;
    await this.save();
    return true;
}

orderSchema.methods.createOrder = async function() {
    
}

const model = mongoose.model('Order', orderSchema);
export default model;