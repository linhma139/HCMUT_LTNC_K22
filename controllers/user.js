import mongoose from "mongoose";
import models from "../model/models.js";
import * as apiHelper from "../util/apiHelper.js";
import * as reqUtil from '../util/reqHelper.js';
import * as geoAPI from '../api/orderAPI.js';

/*
    Priority:
        -> Vehicle type
        -> No overlap
        -> Number of future orders
        -> Estimated distance
        -> Rating
        -> Experience
    No changing time / location
    Canceled order remains in database
*/

export const putOrder = async (req, res, next) => {
    /*
        POST
        req.body[locationFrom,locationTo,timeFrom,vehicleType,spec]: required
        req.body.spec is URL encoded JSON string
        spec : {
            seats
            bag
            size
        }
        timeFrom: YYYY-MM-DDTHH:mm
    */
    const inp = req.body;

    reqUtil.filterProperties(['locationFrom','locationTo','timeFrom','spec','vehicleType'],inp);

    const [coordFrom, coordTo ] = await Promise.all([geoAPI.getCoord(inp.locationFrom),geoAPI.getCoord(inp.locationTo)]);
    const [distance, duration] = await geoAPI.getDistDur(coordFrom,coordTo);

    const additionalInfo = {
        coordFrom,
        coordTo,
        distance,
        timeFrom: new Date(Date.parse(inp.timeFrom)),
        timeTo: new Date(Date.parse(inp.timeFrom) + duration * 1000)
    }

    Object.assign(inp, additionalInfo);
    inp.price = apiHelper.getPrice[inp.vehicleType](inp);

    console.log(inp);

    const vehicle = await models.Vehicle.findBestMatchForOrder(inp);
    if (!vehicle) {
        return res.status(404).json({ success: false, status: 404, message: 'No available vehicle'});
    }
    const driver = await models.Driver.findById(vehicle.driver).exec();
    const customer = new mongoose.Types.ObjectId(req.session.profile);

    const order = new models.Order(Object.assign(inp, {customer, vehicle, driver}));
    try {
        await order.save();
        await vehicle.addOrder(order);
        return res.status(200).json({ success: true, status: 200, message: 'Successfully placed order', data: order});
    } catch (err) {
        next(err);
    }
};

export const getOrderList = async (req,res,next) => {
    /*
        GET
        req.query.[timeFrom,page] : optional
        timeFrom YYYY-MM-DDTHH:mm
    */

    let options = {
        customer: new mongoose.Types.ObjectId(req.session.profile),
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

    const listAllowedProperty = ['employeeID', 'numberPlate', 'canceled', 'timeFrom', 'customer'];

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

        if (orderList.length === 0) {
            return res.status(404).json({ success: false, status: 404, message: 'Page not found'});
        }
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

export const getOrder = async (req, res, next) => {
    /*
        GET
        req.params._id: required
    */
    if (!req.params._id) {
        // return res.status(404).json({ success: false, status: 404, message: 'Order not found'});
        return res.render('error', {status: 404, message: 'Order not found'});
    }
    
    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const order = await models.Order.findById(id).exec();
        if (!order || order.customer != req.session.profile) {
            // return res.status(404).json({ success: false, status: 404, message: 'Order not found'});
            return res.render('error', {status: 404, message: 'Order not found'});
        }
        // return res.status(200).json({ success: true, status: 200, message: 'Successfully retrieved', data: order});
        const driver = (await models.Driver.findById(order.driver).exec()).name;
        const vehicle = (await models.Vehicle.findById(order.vehicle).exec()).numberPlate;
        let ord = order.toObject();
        ord.driver = driver;
        ord.vehicle = vehicle;

        console.log(ord)

        return res.render('donhangID', {data: ord});
    } catch (err) {
        next(err);
    }
};

export const updateOrder = async (req, res, next) => {
    /*
        POST
        req.params._id: required
        req.body[review,canceled]: optional
    */
    if (!req.params._id) {
        return res.status(404).json({ success: false, status: 404, message: 'Order not found'});
    }
    
    try {
        const id = new mongoose.Types.ObjectId(req.params._id);
        const order = await models.Order.findById(id).exec();
        if (!order || order.customer != req.session.profile) {
            return res.status(404).json({ success: false, status: 404, message: 'Order not found'});
        }
        if (req.body.canceled === 'true') {
            if (!order.cancelOrder) {
                return res.status(400).json({ success: false, status: 400, message: 'Can\'t cancel order!'});
            }

            // remove event from vehicle's event list
            const vehicle = await models.Vehicle.findById(order.vehicle).exec();
            if (!vehicle) {
                return res.status(404).json({ success: false, status: 404, message: 'Can\'t update vehicle schedule'});
            }
            models.Vehicle.removeOrder(order);
            await order.cancelOrder();
            return res.status(200).json({ success: true, status: 200, message: 'Successfully canceled order'});
        }

        if (req.body.review) {
            if (order.cannotReview) {
                return res.status(400).json({ success: false, status: 400, message: 'Not allowed to review'});
            }

            const update = {
                customer: order.customer,
                driver: order.driver,
                vehicle: order.vehicle,
                rating: parseInt(req.body.review.rating,10),
                comment: req.body.review.comment
            };

            await models.Review.findOneAndUpdate(options, update, {new: true, upsert: true}).exec();

            return res.status(200).json({ success: true, status: 200, message: 'Successfully updated'});
        }

        return res.status(400).json({ success: false, status: 400, message: 'Nothing was updated'})
    } catch (err) {
        next(err);
    }
};

export const getNewOrder = async (req, res, next) => {
    return res.render('giaohang');
}