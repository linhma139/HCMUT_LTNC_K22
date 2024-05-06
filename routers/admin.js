import express from 'express';
import * as adminInterface from '../controllers/admin.js';
import { isAdmin, isLoggedIn } from '../middleware/authenticationMiddleware.js';


const router = express.Router();

// Authentication middleware
router.use(isLoggedIn);
router.use(isAdmin);

router.get('/', (req, res) => {
    return res.render('pageAdmin', { user: req.session.user });
});

// SEARCH OPERATIONS

router.get('/dashboard', adminInterface.getDashboard); // done

router.get('/drivers', adminInterface.getDriverList); // done

router.get('/orders', adminInterface.getOrderList); 

router.get('/vehicles', adminInterface.getVehicleList); // done

// DRIVER OPERATIONS

router.get('/drivers/:_id', adminInterface.getDriver); // done

router.post('/driver/add', adminInterface.registerDriver); // done

router.get('/driver/add', adminInterface.getDriverAdderView); // done

router.post('/drivers/:_id/delete', adminInterface.deleteDriver); // done

router.get('/drivers/:_id/update', adminInterface.getDriverUpdateView); // done

router.post('/drivers/:_id/update', adminInterface.updateDriver); // done

router.get('/drivers/:_id/review', adminInterface.getDriverReviewList); 

router.get('/drivers/:_id/schedule', adminInterface.getDriverScheduleList);

// ORDER OPERATIONS

router.get('/orders/:_id', adminInterface.getOrder);

// VEHICLE OPERATIONS

router.get('/vehicles/:_id', adminInterface.getVehicle); // done

router.post('/vehicle/add', adminInterface.registerVehicle); // done 

router.get('/vehicle/add', adminInterface.getVehicleAdderView); // done

router.post('/vehicles/:_id/delete', adminInterface.deleteVehicle); // done

router.get('/vehicles/:_id/update', adminInterface.getVehicleUpdateView);

router.post('/vehicles/:_id/update', adminInterface.updateVehicle); 

export default router;