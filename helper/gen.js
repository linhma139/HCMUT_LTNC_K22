import mongoose from 'mongoose';
import { connectToDB } from '../controllers/dbConnection.js';
import { adminFactory } from './1_adminFactory.js';
import { customerFactory } from './2_customerFactory.js';
import { driverFactory } from './3_driverFactory.js';
import { vehicleFactory } from './4_vehicleFactory.js';

const ADMIN_ACCOUNTS = 10;
const CUSTOMER_ACCOUNTS = 50;
const DRIVER_ACCOUNTS = 50;
const VEHICLES = 50;

await connectToDB();

for (let i = 0; i < ADMIN_ACCOUNTS; i++) {
    await adminFactory();
}

for (let i = 0; i < CUSTOMER_ACCOUNTS; i++) {
    await customerFactory();
}

for (let i = 0; i < DRIVER_ACCOUNTS; i++) {
    await driverFactory();
}

for (let i = 0; i < VEHICLES; i++) {
    await vehicleFactory();
}

mongoose.connection.close();