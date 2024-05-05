import express from 'express';
import * as adminInterface from '../controllers/admin.js';
import { isAdmin, isLoggedIn } from '../middleware/authenticationMiddleware.js';


const router = express.Router();

// Authentication middleware
router.use(isLoggedIn);
router.use(isAdmin);

router.get('/', (req, res) => {
    res.render('pageAdmin', { user: req.session.user });
});

// SEARCH OPERATIONS

router.get('/dashboard', adminInterface.getDashboard); // done

router.get('/drivers', adminInterface.getDriverList); // done

router.get('/orders', adminInterface.getOrderList); 

router.get('/vehicles', adminInterface.getVehicleList); // done

// DRIVER OPERATIONS

router.get('/drivers/:_id', adminInterface.getDriver); // done

router.post('/drivers', adminInterface.registerDriver); 

router.get('/driver/add', adminInterface.getDriverAdderView);

router.delete('/drivers/:_id', adminInterface.deleteDriver);

router.patch('/drivers/:_id', adminInterface.updateDriver);

router.get('/drivers/:_id/review', adminInterface.getDriverReviewList); 

router.get('/drivers/:_id/schedule', adminInterface.getDriverScheduleList);

// ORDER OPERATIONS

router.get('/orders/:_id', adminInterface.getOrder);

// VEHICLE OPERATIONS

router.get('/vehicles/:_id', adminInterface.getVehicle); // done

router.post('/vehicles', adminInterface.registerVehicle); 

router.get('/vehicle/add', adminInterface.getVehicleAdderView);

router.delete('/vehicles/:_id', adminInterface.deleteVehicle); 

router.patch('/vehicles/:_id', adminInterface.updateVehicle);

export default router;