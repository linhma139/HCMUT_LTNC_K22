import express from 'express';
import * as driverInterface from '../controllers/driver.js';
import { isDriver, isLoggedIn } from '../middleware/authenticationMiddleware.js';

const router = express.Router();

router.use(isLoggedIn);
router.use(isDriver);

router.get('/vehicle', driverInterface.getVehicle);

router.get('/schedule', driverInterface.getScheduleList);

router.post('/schedule', driverInterface.createSchedule);

router.get('/review', driverInterface.getReviewList);

router.get('/', (req, res) => {
    res.render('driver')
});

export default router;