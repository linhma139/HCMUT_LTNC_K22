import mongoose from 'mongoose';
import models from '../model/models.js';
import * as reqUtil from '../util/reqHelper.js';

export const getVehicle = async (req,res,next) => {
    /*
        GET
        req.params._id: required
    */
    try {
        const driver = await models.Driver.findById(new mongoose.Types.ObjectId(req.session.profile)).exec();
        if (!driver) {
            return res.status(404).json({ success: false, status: 404, message: 'Driver not found'});
        }
        if (!driver.vehicle) {
            return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
        }
        const vehicle = await models.Vehicle.findById(driver.vehicle).exec();
        if (!vehicle) {
            return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
        }
        return res.status(200).json({ success: true, status: 200, message: 'Successfully retrieved', data: vehicle});
    } catch (err) {
        next(err);
    }
};

export const getScheduleList = async (req,res,next) => {
    /*
        GET
        req.body.timeFrom: required
        req.body.timeTo: required
        timeFrom, timeTo YYYY-MM-DDTHH:mm
    */

    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    try {
        const driver = await models.Driver.findById(new mongoose.Types.ObjectId(req.session.profile)).exec();
        if (!driver) {
            return res.status(404).json({ success: false, status: 404, message: 'Driver not found'});
        }
        if (!driver.vehicle) {
            return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
        }
        const vehicle = await models.Vehicle.findById(driver.vehicle).exec();
        if (!vehicle) {
            return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
        }
        
        const timeFrom = new Date(Date.parse(req.body.timeFrom));
        const timeTo = new Date(Date.parse(req.body.timeTo));
        const scheduleList = (await vehicle.getScheduleList(timeFrom, timeTo)).slice((page-1)*limit, page*limit);

        if (scheduleList.length == 0) {
            return res.status(404).json({ success: false, status: 404, message: 'No schedule found'});
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

export const createSchedule = async (req,res,next) => {
    /*
        POST
        req.body.timeFrom: required
        req.body.timeTo: required
        timeFrom, timeTo YYYY-MM-DD
    */

    const timeFrom = new Date(Date.parse(req.body.timeFrom));
    const timeTo = new Date(Date.parse(req.body.timeTo));

    try {
        const driver = await models.Driver.findById(new mongoose.Types.ObjectId(req.session.profile)).exec();
        if (!driver) {
            return res.status(404).json({ success: false, status: 404, message: 'Driver not found'});
        }
        if (!driver.vehicle) {
            return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
        }
        const vehicle = await models.Vehicle.findById(driver.vehicle).exec();
        if (!vehicle) {
            return res.status(404).json({ success: false, status: 404, message: 'Vehicle not found'});
        }
        const coord = await vehicle.getEstimatedLocation(timeFrom);

        const event = {
            eventType: 'Not available',
            timeFrom: timeFrom,
            timeTo: timeTo,
            coordFrom: coord,
            coordTo: coord
        }

        if (await vehicle.createEvent(event)) {
            return res.status(200).json({ success: true, status: 200, message: 'Schedule successfully updated'});
        }
        return res.status(409).json({ success: false, status: 409, message: 'Conflict'});
    } 
    catch (err) {
        next(err);
    }
};

export const getReviewList = async (req,res,next) => {
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
        const id = new mongoose.Types.ObjectId(req.session.user);
        const reviews = await models.Review
        .find({driver: id}, 'order rating comment')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

        if (reviews.length == 0) {
            return res.status(404).json({ success: false, status: 404, message: 'Page not found'});
        }

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