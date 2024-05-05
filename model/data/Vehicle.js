import mongoose from 'mongoose';

const EVENT_TYPE = ['Maintainance', 'In-use', 'Not available', 'Registered'];
const VEHICLE_TYPE = ['Car', 'Truck', 'Container'];

const eventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: [true, 'Required'],
        validate: {
            validator: (v) => {
                return EVENT_TYPE.includes(v);
            },
            message: "Invalid"
        }
    },

    timeFrom: {
        type: Date,
        required: [true, 'Required']
    },

    timeTo: {
        type: Date,
        required: [true, 'Required']
    },

    coordFrom: {
        type: [Number],
        required: [true, 'Required']
    },

    coordTo: {
        type: [Number],
        required: [true, 'Required']
    },

    // optional if only eventType is 'In-use'
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    }
})

const vehicleSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Required'],
        validate: {
            validator: (v) => {
                return VEHICLE_TYPE.includes(v);
            },
            message: "Invalid"
        }
    },

    fuelType: {
        type: String,
        required: [true, 'Required'],
    },

    numberPlate: {
        type: String,
        required: [true, 'Required'],
        unique: true,
        index: true,
    },

    registeredDate: {
        type: Date,
        default: Date.now(),
        immutable: true,
    },

    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    
    eventList: {
        type: [eventSchema],
    },

    currentLocation: {
        type: [Number],
        required: [true, 'Required'],
        default: [0, 0]
    },
    status: {
        type: String,
        default: 'Available'
    },
    spec: {}
});

vehicleSchema.statics.updateStatus = async function() {
    const vehicles = await mongoose.model('Vehicle').find();
    vehicles.forEach(async (vehicle) => {
        vehicle.status = await vehicle.getCurrentStatus();
        await vehicle.save();
    });
}

vehicleSchema.methods.getScheduleList = async function(timeFrom, timeTo) {
    const event = await mongoose.model('Vehicle').aggregate([
        {
            $unwind: '$eventList'
        },
        {
            $match: {
                _id: this._id
            }
        },
        {
            $match: {
                'eventList.timeFrom' : { $gte: timeFrom},
                'eventList.timeTo': { $lte: timeTo}
            }
        },
        {
            $sort: {
                'eventList.timeFrom': -1
            }
        },
        {
            $project: {
                _id: 0,
                eventType: '$eventList.eventType',
                timeFrom: '$eventList.timeFrom',
                timeTo: '$eventList.timeTo',
                coordFrom: '$eventList.coordFrom',
                coordTo: '$eventList.coordTo'
            }
        }
    ]);

    return event;
}

vehicleSchema.methods.initEvent = async function(coord) {
    const event = ({
        eventType: 'Registered',
        timeFrom: Date.now(),
        timeTo: Date.now(),
        coordFrom: coord,
        coordTo: coord
    });
    this.eventList.push(event);
    await this.save();
    return true;
}

vehicleSchema.methods.createEvent = async function(event){
    if (await this.isOverlapped(event.timeFrom, event.timeTo)) return false;
    this.eventList.push(event);
    await this.save();
    return true;
}

vehicleSchema.methods.getCurrentEvent = async function() {
    const event = await mongoose.model('Vehicle').aggregate([
        {
            $unwind: '$eventList'
        },
        {
            $match: {
                _id: this._id
            }
        },
        {
            $match: {
                'eventList.timeFrom': { $lte: new Date(Date.now()) },
                'eventList.timeTo': { $gte: new Date(Date.now()) }
            }
        },
        {
            $project: {
                _id: 0,
                eventType: '$eventList.eventType',
                timeFrom: '$eventList.timeFrom',
                timeTo: '$eventList.timeTo',
                coordFrom: '$eventList.coordFrom',
                coordTo: '$eventList.coordTo'
            }
        },
        {
            $limit: 1
        }
    ]);

    return event[0];
}

vehicleSchema.methods.getCurrentStatus = async function() {
    const event = await this.getCurrentEvent();
    return event?.eventType || 'Available';
}

vehicleSchema.methods.getEstimatedLocation = async function(timeFrom) {
    const event = await mongoose.model('Vehicle').aggregate([
        {
            $unwind: '$eventList'
        },
        {
            $match: {
                _id: this._id
            }
        },
        {
            $match: {
                'eventList.timeTo' : { $lte: timeFrom}
            }
        },
        {
            $sort: {
                'eventList.timeTo': -1
            }
        },
        {
            $limit: 1
        },
        {
            $project: {
                _id: 0,
                coordTo: '$eventList.coordTo'
            }
        }
    ]);

    return event[0]?.coordTo;
}

vehicleSchema.methods.isOverlapped = async function(timeFrom, timeTo) {
    const event = await mongoose.model('Vehicle').aggregate([
        {
            $unwind: '$eventList'
        },
        {
            $match: {
                _id: this._id,
                $or: [
                    { $and: [ { 'eventList.timeFrom': { $lte: timeFrom } }, { 'eventList.timeTo': { $gte: timeFrom } } ] },
                    { $and: [ { 'eventList.timeFrom': { $lte: timeTo } }, { 'eventList.timeTo': { $gte: timeTo } } ] },
                    { $and: [ { 'eventList.timeFrom': { $gte: timeFrom } }, { 'eventList.timeTo': { $lte: timeTo } } ] },
                    { $and: [ { 'eventList.timeFrom': { $lte: timeFrom } }, { 'eventList.timeTo': { $gte: timeTo } } ] }
                ]
            }
        }
    ]);
    return event.length > 0;
};

vehicleSchema.methods.addOrder = async function(order) {
    const event = {
        eventType: 'In-use',
        timeFrom: order.timeFrom,
        timeTo: order.timeTo,
        coordFrom: order.coordFrom,
        coordTo: order.coordTo,
        order: order._id
    }

    this.eventList.push(event);
    await this.save();
}

vehicleSchema.methods.getNumFutureOrders= async function() {
    const event = await mongoose.model('Vehicle').aggregate([
        {
            $unwind: '$eventList'
        },
        {
            $match: {
                _id: this._id
            }
        },
        {
            $match: {
                'eventList.timeTo' : { $gte: new Date(Date.now()) },
            }
        }
    ]);

    return event.length;
}

vehicleSchema.methods.assignBestDriver = async function() {
    const driver = await mongoose.model('Driver').findAvailableDriverFromType(this.type);
    if (!driver) return;
    this.driver = driver._id;
    driver.vehicle = this._id;
    await this.save();
    await driver.save();
}

vehicleSchema.methods.assignDriver = async function(driver) {
    if (this.driver !== null || driver.vehicle !== null || this.type !== driver.licenseType) return false;
    this.driver = driver._id;
    driver.vehicle = this._id;
    await driver.save();
    await this.save();
    return true;
}

vehicleSchema.methods.removeDriver = async function() {
    if (this.driver !== null) {
        const driver = await mongoose.model('Driver').findByIdAndUpdate(this.driver, { vehicle: null }).exec();
        await driver.save();
    }
    this.driver = null;
    await this.save();
    return true;
}

vehicleSchema.methods.deleteVehicle = async function() {
    await this.removeDriver();
    await this.deleteOne();
}

vehicleSchema.statics.findBestMatchForOrder = async function(order) {
    const estimateDist = (coord1, coord2) => {
        const { sin, cos, acos } = Math;
        const lat1 = coord1[0];
        const lon1 = coord1[1];
        const lat2 = coord2[0];
        const lon2 = coord2[1];
        return acos(sin(lat1)*sin(lat2)+cos(lat1)*cos(lat2)*cos(lon2-lon1))*6371;
    }

    const t1 = new Date(order.timeFrom);
    const t2 = new Date(order.timeTo);

    // Type and spec
    let vehicle = await mongoose.model('Vehicle').findFittingTypeNSpec(order.vehicleType, order.spec);

    // Overlapped event
    const isOverlapped = await Promise.all(vehicle.map(v => v.isOverlapped(t1,t2)));
    vehicle = vehicle.filter((v,idx) => isOverlapped[idx] == false);

    // Number of future orders
    const numFutureOrders = await Promise.all(vehicle.map(v => v.getNumFutureOrders()));
    const minOrders = Math.min(...numFutureOrders);
    vehicle = vehicle.filter((v,idx) => numFutureOrders[idx] === minOrders);

    // Distance from location
    const location = await Promise.all(vehicle.map(v => v.getEstimatedLocation(t1)));
    const distance = await Promise.all(location.map(l => estimateDist(l,order.coordFrom)));
    const minDist = Math.min(...distance);
    vehicle = vehicle.filter((v,idx) => distance[idx] === minDist);

    // Rating
    const driversRa = await Promise.all(vehicle.map(v => mongoose.model('Driver').findById(v.driver)));
    const rating = (await Promise.all(driversRa.map(d => d.getRating()))).map(r => isNaN(r)? 0 : r);   
    const maxRating = Math.max(...rating);
    vehicle = vehicle.filter((v,idx) => rating[idx] === maxRating);

    // Experience
    const driversEx = await Promise.all(vehicle.map(v => mongoose.model('Driver').findById(v.driver)));
    const experience = (await Promise.all(driversEx.map(d => d.getExperience()))).map(e => isNaN(e)? 0 : e);
    const maxExperience = Math.max(...experience);
    vehicle = vehicle.filter((v,idx) => experience[idx] === maxExperience);

    return vehicle[0];
}

vehicleSchema.statics.findFittingTypeNSpec = async function(type, spec) {
    // Failsafe kinda
    return await mongoose.model('Vehicle').find({
        type: type,
        driver: { $ne: null },
        spec: spec
    });
};

vehicleSchema.statics.removeOrder = async function(order) {
    const event = await mongoose.model('Vehicle').aggregate([
        {
            $unwind: '$eventList'
        },
        {
            $match: {
                _id: order.vehicle
            }
        },
        {
            $match: {
                'eventList.order': order._id
            }
        },
        {
            $project: {
                _id: 1,
                'eventList._id': 1
            }
        }
    ]);

    console.log(event)

    if (event.length === 0) return false;
    const vehicle = await mongoose.model('Vehicle').findById(event[0]._id);
    vehicle.eventList.id(event[0].eventList._id).deleteOne();
    vehicle.save();
    return true;
}

vehicleSchema.methods.getLastRepairTime = async function() {
    const event = await mongoose.model('Vehicle').aggregate([
        {
            $unwind: '$eventList'
        },
        {
            $match: {
                _id: this._id
            }
        },
        {
            $match: {
                'eventList.eventType': 'Maintainance'
            }
        },
        {
            $sort: {
                'eventList.timeTo': -1
            },
        },
        {
            $limit: 1
        },
        {
            $project: {
                _id: 0,
                timeTo: '$eventList.timeTo'
            }
        }
    ]);

    return event[0]?.timeTo;
}

vehicleSchema.statics.getVehiclesNeedRepair = async function(limit = 10, page = 1) {
    let vehicle = await mongoose.model('Vehicle').find().exec();

    let lastRepairTime = await Promise.all(vehicle.map(v => v.getLastRepairTime()));
    vehicle = vehicle.filter((v,idx) => {
        return (Date.now() - lastRepairTime[idx]) > 356 * 24 * 60 * 60 * 1000 / 2;
    });

    return [vehicle.length,vehicle.slice((page - 1) * limit, page * limit)];
}


const Vehicle = mongoose.model('Vehicle', vehicleSchema);

const carSchema =new mongoose.Schema({
    spec: {
        seats: {
            type: Number,
            required: [true, 'Required'],
            min: [2, 'Too low'],
            max: [8, 'Too high']
        },

        // Number of small bags a car can carry
        // Refer: https://www.orbitcarhire.com/en/blog/rental-car-luggage-capacity/
        bags: {
            type: Number,
            required: [true, 'Required'],
            min: [1, 'Too low'],
            max: [4, 'Too high']
        }
    }
});

carSchema.statics.findFittingTypeNSpec = async function(type, spec) {
    return await mongoose.model('Car').find({
        type: type,
        driver: { $ne: null },  
        spec: {
            seats: { $gte: spec.seats },
            bags: { $gte: spec.bags }
        }
    })
}

const TRUCK_SIZE = ['Small', 'Medium', 'Large'];
// 500kg -> 2t -> 8t
// Refer: https://eparking.vn/kich-thuoc-xe-tai/

const truckSchema = new mongoose.Schema({
    spec: {
        size: {
            type: String,
            required: [true, 'Required'],
            validate: {
                validator: (v) => {
                    return TRUCK_SIZE.includes(v);
                },
                message: "Invalid"
            }
        }
    }
});

truckSchema.statics.findFittingTypeNSpec = async function(type, spec) {
    return await mongoose.model('Truck').find({
        type: type,
        driver: { $ne: null },  
        spec: spec
    })
}

const CONTAINER_TYPE = ['20', '40'];

const containerSchema = new mongoose.Schema({
    spec: {
        size: {
            type: String,
            required: [true, 'Required'],
            validate: {
                validator: (v) => {
                    return CONTAINER_TYPE.includes(v);
                },
                message: "Invalid"
            }
        }
    }
});

containerSchema.statics.findFittingTypeNSpec = async function(type, spec) {
    return await mongoose.model('Container').find({
        type: type,
        driver: { $ne: null },  
        spec: spec
    })
}

const Car = Vehicle.discriminator('Car',carSchema);
const Truck = Vehicle.discriminator('Truck',truckSchema);
const Container = Vehicle.discriminator('Container',containerSchema);

export { Vehicle, Car, Truck, Container}

export default Vehicle;