import mongoose, { mongo } from 'mongoose';
import Profile from './Profile.js';
import Vehicle from '../Vehicle.js';
import * as random from '../../../util/randomGen.js';

const DRIVER_LICENSE_TYPE = ['Truck', 'Car', 'Container'];

const driverSchema = new mongoose.Schema({
    age: {
        type: Number,
        required: [true, 'Required'],
        min: [18, 'Too young'],
        max: [60, 'Too old']
    },

    licenseType: {
        type: String,
        required: [true, 'Required'],
        validate: {
            validator: (v) => {
                return DRIVER_LICENSE_TYPE.includes(v);
            },
            message: "Invalid"
        }
    },

    employeeID: {
        type: String,
        required: [true, 'Required'],
        unique: true,
        index: true
    },

    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    }
});

driverSchema.statics.findAvailableDriverFromType = async function(licenseType) {
    const driver = await this.aggregate
    ([
        {
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'driver',
                as: 'reviews'
            }
        },
        {
            $addFields: {
                rating: { $avg: '$reviews.rating' }
            }
        },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'driver',
                as: 'orders'
            }
        },
        {
            $addFields: { 
                experience: { $size: '$orders' } 
            }
        },
        {
            $match: {
                licenseType: licenseType,
                vehicle: null
            }
        },
        {
            $sort: { rating: -1, experience: -1 }
        },
        {
            $limit: 1
        }
    ]);

    return (driver.length == 0)? null : await mongoose.model('Driver').findById(driver[0]._id).exec();
}

driverSchema.methods.assignVehicle = async function(vehicle) {
    if (this.vehicle !== null || vehicle.driver !== null || this.licenseType !== vehicle.type ) return false;
    this.vehicle = vehicle._id;
    vehicle.driver = this._id;
    await vehicle.save();
    await this.save();
    return true;
}

driverSchema.methods.removeVehicle = async function() {
    if (this.vehicle !== null) {
        const vehicle = await Vehicle.findByIdAndUpdate(this.vehicle, { driver: null }).exec();
        await vehicle.save();
    }
    this.vehicle = null;
    await this.save();
}

driverSchema.methods.deleteProfile = async function() {
    await this.removeVehicle();
    await this.deleteOne();
}

driverSchema.methods.getRating = async function() {
    const reviews = await mongoose.model('Review').find({ driver: this._id }).exec();
    return reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length;
}

driverSchema.methods.getExperience = async function() {
    const orders = await mongoose.model('Order').find({ driver: this._id }).exec();
    return orders.length;
}

driverSchema.statics.generateEmployeeID = async function() {
    let ID = random.randomID();
    while (await this.findOne({employeeID: ID}).exec()) {
        ID = random.randomID();
    }
    return ID;
}

driverSchema.statics.findAvailableDriversFromType = async function(licenseType, limit = 10, page = 1) {
    const driver = await this.aggregate
    ([
        {
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'driver',
                as: 'reviews'
            }
        },
        {
            $addFields: {
                rating: { $avg: '$reviews.rating' }
            }
        },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'driver',
                as: 'orders'
            }
        },
        {
            $addFields: { 
                experience: { $size: '$orders' } 
            }
        },
        {
            $match: {
                licenseType: licenseType,
                vehicle: null
            }
        },
        {
            $sort: { rating: -1, experience: -1 }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
    ]);

    return driver;
}

const Driver = Profile.discriminator('Driver', driverSchema);

export default Driver;