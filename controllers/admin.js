import mongoose from 'mongoose';
import Randexp from 'randexp';
import models from '../model/models.js';
import regex from '../util/regex.js';
import * as reqUtil from '../util/reqHelper.js';

export const registerDriver = async (req,res,next) => {
    /*
        POST
        req.body.[name,age,phoneNumber,email,licenseType] : required 
    */

    const listAllowedProprety = ['name', 'age', 'phoneNumber', 'email', 'licenseType', 'employeeID'];
    const listNumProperty = ['age'];

    reqUtil.filterProperties(listAllowedProprety, req.body);
    reqUtil.toNumProperties(listNumProperty, req.body);
    Object.assign(req.body, {
        employeeID: await models.Driver.generateEmployeeID(),
        accountType: 'Driver',
        password: new Randexp(regex.passwordRegex).gen(),
        username: new Randexp(regex.usernameRegex).gen()
    });

    try {
        await models.Account.createAccount(req.body);
        return res.redirect('/admin/drivers');
        //return res.status(201).json({ success: true, status: 201, message: 'SUCCESS: created driver account'});
    } 
    catch (err) {
        next(err);
    }
};

export const deleteDriver = async (req,res,next) => {
    /*
        DELETE
        req.params._id : required
    */

    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const driverProfile = await models.Driver.findById(id).exec();
        const driverAccount = await models.Account.findOne({profile: driverProfile?._id}).exec();
        if (driverProfile && driverAccount) {
            driverAccount.deleteAccount();
            res.redirect('/admin/drivers');
            //return res.status(200).json({ success: true, status: 200, message: 'Deleted driver account'});;
        }
        // return res.status(404).json({ success: false, status: 404, message: 'Driver not found'});
        return res.render('error', {status: 404, message: 'Driver not found'});
    }
    catch (err) {
        next(err);
    }
};

export const registerVehicle = async (req,res,next) => {
    /*
        POST
        req.body.[type, fuelType, numberPlate, spec] : required
    */

    const listNumProperty = ['currentLocation'];
    const listAllowedProperty = ['type', 'fuelType', 'numberPlate', 'size', 'seats', 'bags'];

    reqUtil.filterProperties(listAllowedProperty, req.body);
    reqUtil.toNumProperties(listNumProperty, req.body);

    req.body.spec = {
        size: req.body.size,
        seats: req.body.seats,
        bags: req.body.bags
    }

    try {
        const vehicleInfo = new mongoose.model(req.body.type)(req.body);
        const vehicle = await vehicleInfo.save();
        await vehicle.assignBestDriver();
        return res.redirect('/admin/vehicles');
        // return res.status(201).json({ success: true, status: 201, message: 'Registered vehicle', data: vehicle});
    } 
    catch (err) {
        next(err);
    }
};

export const deleteVehicle = async (req,res,next) => {
    /*
        DELETE
        req.params._id : required
    */

    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const vehicle = await models.Vehicle.findById(id).exec();
        if (vehicle) {
            await vehicle.deleteVehicle();
            return res.redirect('/admin/vehicles');
            //return res.status(200).json({ success: true, status: 200, message: 'Successfully deleted'});
        }
        // return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
        return res.render('error', {status: 404, message: 'Vehicle not found'});
    }
    catch (err) {
        next(err);
    }
};

export const getDriverList = async (req,res,next) => {
    /*
        GET
        req.query.[experience, employeeID, numberPlate, licenseType, ratingSort, expSort] : optional
        req.query.page : optional
    */

    let options = {
        experience: req.query.experience,
        employeeID: req.query.employeeID,
        'vehicles.numberPlate': req.query.numberPlate,
        licenseType: req.query.licenseType
    };

    let sortOptions = {
        rating: req.query.ratingSort,
        experience: req.query.expSort
    };

    let viewOptions = {
        '_id' : 1,
        'name': 1,
        'age' : 1,
        'phoneNumber' : 1,
        'licenseType' : 1,
        'employeeID' : 1,
        'experience' : 1,
        'rating' : 1,
        'numberPlate': '$vehicles.numberPlate'
    }

    const listNumProperty = ['rating', 'experience'];
    
    reqUtil.removeUndefinedProperties(options);
    reqUtil.toNumProperties(listNumProperty, options);
    reqUtil.removeInvalidSortOptions(sortOptions);
    reqUtil.removeUndefinedProperties(sortOptions);

    const page = parseInt(req.query.page,10) || 1;
    const limit = 8;

    try {
        const driverList = await models.Driver.aggregate([
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
                $lookup: {
                    from: 'vehicles',
                    localField: '_id',
                    foreignField: 'driver',
                    as: 'vehicles'
                }
            },
            {
                $unwind: {
                    path: '$vehicles',
                    preserveNullAndEmptyArrays: true
                }
            },
            { 
                $match: options 
            },
            {
                $sort: sortOptions
            },
            {
                $project: viewOptions
            },
            {
                $group: {
                    _id: '$_id',
                    data: { $push: '$$ROOT' }
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            },
        ])

        return res.render('driver', {data: driverList});
        // return res.status(200).json({
        //     success: true,
        //     status: 200,
        //     message: 'Successfully retrieved',
        //     page: page,
        //     data: driverList
        // });
    }
    catch (err) {
        next(err);
    }
};

export const getDriver = async (req, res, next) => {
    /*
        GET
        req.params._id : required
    */
    
    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const driver = await models.Driver.findById(id).exec();
        let rating = await models.Driver.aggregate([
            {
                $match: { _id: id }
            },
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
                $project: { rating: 1 }
            }
        ]);
        rating = rating?.[0]?.rating;
        if (!driver) {
            // return res.status(404).json({ success: false, status: 404, message: 'Driver not found'});
            return res.render('error', {status: 404, message: 'Driver not found'});
        }
        return res.render('taixe', {data: Object.assign(driver, {rating})});
        //return res.status(200).json({ success: true, status: 200, message: 'Successfully retrieved', data: driver});
    }
    catch (err) {
        next(err);
    }
};

export const getDriverReviewList = async (req,res,next) => {
    /*
        GET
        req.query.ratingSort: optional
    */

    let sortOptions = {
        rating: req.query.ratingSort,
    };

    reqUtil.removeInvalidSortOptions(sortOptions);
    reqUtil.removeUndefinedProperties(sortOptions);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = 5;

    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const reviews = await models.Review
        .find({driver: id}, 'order rating comment')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Successfully retrieved',
            page: page,
            data: reviews
        });
    }
    catch (err) {
        next(err);
    }
};

export const getDriverScheduleList = async (req,res,next) => {
/*
    GET
    req.body.timeFrom: required
    req.body.timeTo: required
    timeFrom, timeTo YYYY-MM-DDTHH:mm
*/

    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    try {
        const driver = await models.Driver.findById(new mongoose.Types.ObjectId(req.params._id)).exec();
        if (!driver) {
            // return res.status(404).json({ success: false, status: 404, message: 'Driver not found'});
            return res.render('error', {status: 404, message: 'Driver not found'});
        }
        if (!driver.vehicle) {
            // return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
            return res.render('error', {status: 404, message: 'Vehicle not found'});
        }
        const vehicle = await models.Vehicle.findById(driver.vehicle).exec();
        if (!vehicle) {
            // return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
            return res.render('error', {status: 404, message: 'Vehicle not found'});
        }
        
        const timeFrom = new Date(Date.parse(req.body.timeFrom));
        const timeTo = new Date(Date.parse(req.body.timeTo));
        const scheduleList = (await vehicle.getScheduleList(timeFrom, timeTo)).slice((page-1)*limit, page*limit);

        if (scheduleList.length == 0) {
            // return res.status(404).json({ success: false, status: 404, message: 'No schedule found'});
            return res.render('error', {status: 404, message: 'No schedule found'});
        }

        return res.status(200).json({ 
            success: true, 
            status: 200, 
            message: 'Successfully retrieved', 
            data: scheduleList
        });
    } 
    catch (err) {
        next(err);
    }
}

export const getVehicleList = async (req,res,next) => {
    /*
        GET
        req.query.[type, fuelType, numberPlate, dateSort, seats, bags, size] : optional
    */

    let options = {
        type: req.query.type,
        fuelType: req.query.fuelType,
        numberPlate: req.query.numberPlate,
        'spec.seats': req.query.seats,
        'spec.bags': req.query.bags,
        'spec.size': req.query.size,
        'status': req.query.status
    };

    let viewOptions = {
        '_id': 1,
        'type': 1,
        'fuelType': 1,
        'numberPlate': 1,
        'spec': 1,
        'status': 1,
        'driver': '$drivers.name'
    };

    reqUtil.toNumProperties(['spec.seats', 'spec.bags'], options);
    reqUtil.removeUndefinedProperties(options);

    console.log(options);

    const page = parseInt(req.query.page,10) || 1;
    const limit = 8;

    await models.Vehicle.updateStatus();

    try {
        const vehicleList = await models.Vehicle.aggregate([
            {
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: 'vehicle',
                    as: 'drivers'
                }
            },
            {
                $unwind: {
                    path: '$drivers',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: options
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            },
            {
                $project: viewOptions
            }
        
        ])

        // if (vehicleList.length === 0) {
        //     return res.status(404).json({ success: false, status: 404, message: 'Page not found'});
        // }
        return res.render('xe', {data: vehicleList});
        // return res.status(200).json({
        //     sucess: true,
        //     status: 200,
        //     message: 'Successfully retrieved',
        //     page: page,
        //     data: vehicleList
        // });
    }
    catch (err) {
        next(err);
    }
};
export const getVehicle = async (req,res,next) => {
    /*
        GET
        req.params._id : required
    */
    
    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const vehicle = await models.Vehicle.findById(id).exec();
        if (!vehicle) {
            // return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
            return res.render('error', {status: 404, message: 'Vehicle not found'});
        }
        return res.render('xe-item', {data: vehicle})
        //return res.status(200).json({ success: true, status: 200, message: 'Successfully retrieved', data: vehicle});
    }
    catch (err) {
        next(err);
    }
};

export const updateDriver = async (req,res,next) => {
    /*
        PATCH
        req.params._id : required
        req.body.numberPlate : optional
    */

    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const driver = await models.Driver.findById(id).exec();
        if (!driver) {
            // return res.status(404).json({ success: false, status: 404, message: 'Driver not found'});
            return res.render('error', {status: 404, message: 'Driver not found'});
        }
        if (req.body.numberPlate) {
            const success = await driver.assignVehicle(await models.Vehicle.findOne({numberPlate: req.body.numberPlate}).exec());
            return res.redirect('.');
        } else {
            await driver.removeVehicle();
            // return res.status(200).json({ success: true, status: 200, message: 'Successfully updated'});
            return res.redirect('.');
        }
        return res.status(400).json({ success: false, status: 400, message: 'Vehicle doesn\'t exist'});
    }
    catch (err) {
        next(err);
    }
};

export const updateVehicle = async (req,res,next) => {
    /*
        PATCH
        req.params._id : required
        req.body.[numberPlate, fuelType, employeeID, maintainanceDate] : optional
    */

    const listAllowedProperty = ['numberPlate', 'fuelType', 'employeeID', 'maintainanceDate'];
    reqUtil.filterProperties(listAllowedProperty, req.body);
    reqUtil.removeUndefinedProperties(req.body);

    let resObj = {};
    for (let key in req.body) {
        resObj[key] = 'Not updated';
    }

    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const vehicle = await models.Vehicle.findById(id).exec();
        if (!vehicle) {
            // return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
            return res.render('error', {status: 404, message: 'Vehicle not found'});
        }

        // Number plate
        if (req.body.numberPlate) {
            await vehicle.updateOne({ numberPlate: req.body.numberPlate }).exec();
            resObj.numberPlate = 'Success';
        }
        // Fuel type
        if (req.body.fuelType) {
            await vehicle.updateOne({ fuelType: req.body.fuelType }).exec();
            resObj.fuelType = 'Success';
        };
        // Driver
        if (req.body.employeeID) {
            const driver = await models.Driver.findOne({employeeID: req.body.employeeID}).exec();
            if (driver && await vehicle.assignDriver(driver)) resObj.employeeID = 'Success';
        }
        // Maintainance date YYYY-MM-DD
        if (req.body.maintainanceDate) {
            const timeFrom = new Date(Date.parse(req.body.maintainanceDate));
            const timeTo = new Date(timeFrom);
            timeTo.setDay(timeTo.getDay() + 1);

            const lastLocation = await vehicle.getEstimatedLocation(timeFrom);

            const event = {
                eventType: 'Maintainance',
                timeFrom: timeFrom,
                timeTo: timeTo,
                coordFrom: lastLocation,
                coordTo: lastLocation
            }
            if (vehicle.createEvent(event)) {
                resObj.maintainanceDate = 'Success';
            }
        }
        return res.redirect('.');
        //return res.status(200).json({ success: true, status: 200, message: 'Successfully updated', data: resObj});
    } 
    catch (err) { 
        next(err) 
    }
};

export const getOrderList = async (req,res,next) => {
    /*
        GET
        req.query.[timeFrom,page] : optional
        timeFrom YYYY-MM-DDTHH:mm
    */

    let options = {
        canceled: req.query.canceled,
        timeFrom: new Date(Date.parse(req.query.date)) == 'Invalid Date'? undefined : new Date(Date.parse(req.query.date))
    };

    let sortOptions = {
        timeFrom: req.query.dateSort,
        price: req.query.priceSort,
        distance: req.query.distanceSort
    };

    const viewOptions = {
        '_id' : 1,
        'distance' : 1,
        'price' : 1,
        'canceled' : 1
    }

    const listAllowedProperty = ['employeeID', 'numberPlate', 'canceled', 'timeFrom'];

    reqUtil.filterProperties(listAllowedProperty, options);
    reqUtil.removeUndefinedProperties(options);
    reqUtil.removeInvalidSortOptions(sortOptions);
    reqUtil.removeUndefinedProperties(sortOptions);

    console.log(options);

    const page = parseInt(req.query.page,10) || 1;
    const limit = 5;

    try {
        const orderList = await models.Order.aggregate([
            {
                $match: options
            },
            {
                $sort: sortOptions
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            },
            {
                $project: viewOptions
            }
        ])

        return res.status(200).json({
            sucess: true,
            status: 200,
            message: 'Successfully retrieved',
            page: page,
            data: orderList
        });
    
    } 
    catch (err) {
        next(err);
    }
};

export const getOrder = async (req,res,next) => {
    if (!req.params._id) {
        // return res.status(404).json({ success: false, status: 404, message: 'Order not found'});
        return res.render('error', {status: 404, message: 'Order not found'});
    }
    
    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const order = await models.Order.findById(id).exec();
        if (!order) {
            return res.render('error', {status: 404, message: 'Order not found'});
            // return res.status(404).json({ success: false, status: 404, message: 'Order not found'});
        }

        const driver = (await models.Driver.findById(order.driver).exec()).name;
        const vehicle = (await models.Vehicle.findById(order.vehicle).exec()).numberPlate;

        let ord = order.toObject();
        ord.driver = driver;
        ord.vehicle = vehicle;

        return res.render('donhangID', {data: ord});
        // return res.status(200).json({ success: true, status: 200, message: 'Successfully retrieved', data: ord});
    } 
    catch (err) {
        next(err);
    }
};

export const getDashboard = async (req,res,next) => {  
    /* 
        sum of kilometers (last week, last 30 days, last year)
        sum of registered user (last week, last 30 days, last year)
        sum of order (last week, last 30 days, last year)
        sum of money (query from event, + price - cost)
    */

    const today = new Date(Date.now());
    const lastWeek = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today - 30 * 24 * 60 * 60 * 1000);
    const lastYear = new Date(today - 365 * 24 * 60 * 60 * 1000);

    const totalUser = await models.Customer.countDocuments().exec();
    const totalGrossThisYear = [];
    for (let i = 0; i < 12; i++) {
        const timeFrom = new Date(today.getFullYear(), i, 1);
        const timeTo = new Date(today.getFullYear(), i + 1, 1);
        let totalGrossOfMonth = await models.Order.aggregate([
            {
                $match: {
                    timeFrom: { $gte: timeFrom, $lt: timeTo }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price' }
                }
            }
        ]);
        totalGrossOfMonth = totalGrossOfMonth.length == 0? 0 : totalGrossOfMonth[0].total;
        totalGrossThisYear.push(totalGrossOfMonth);
    }
    const totalDriver = await models.Driver.countDocuments().exec();
    const totalVehicle = await models.Vehicle.countDocuments().exec();
    const totalOrderThisYear = await models.Order.countDocuments({
        timeFrom: { $gte: new Date(today.getFullYear(), 0, 1) }
    }).exec();
    const totalKmRan = (await models.Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: '$distance' }
            }
        }
    ]))?.[0].total;
    const totalDriverWithVehicle = await models.Driver.countDocuments({vehicle: { $ne: null }}).exec();
    const [totalFix,vehicleList] = await models.Vehicle.getVehiclesNeedRepair();
    
    return res.render('quanly', {totalUser, totalGrossThisYear, totalDriver, totalVehicle, totalOrderThisYear, totalKmRan, totalDriverWithVehicle, totalFix, vehicleList});
    res.end();
};

export const getVehicleAdderView = async (req,res,next) => {
    return res.render('addxe');
}

export const getDriverAdderView = async (req,res,next) => {
    return res.render('adddr');
}

export const getDriverUpdateView = async (req,res,next) => {
    return res.render('updateDriver', {data : req.params._id});
}

export const getVehicleUpdateView = async (req,res,next) => {
    return res.render('updateVehicle', {data : req.params._id});
}