import express from 'express';
import * as userInterface from '../controllers/user.js';
import { isLoggedIn } from '../middleware/authenticationMiddleware.js';

const router = express.Router();

router.use(isLoggedIn);

router.get('/order', userInterface.getOrderList); 

router.get('/order/new', userInterface.getNewOrder);

router.post('/order', userInterface.putOrder); 

router.get('/order/:_id', userInterface.getOrder); // done

router.post('/order/:_id', userInterface.updateOrder);

router.get('/', (req, res) => {
    return res.render('index')
});

export default router;