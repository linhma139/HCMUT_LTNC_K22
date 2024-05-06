import express from 'express';
import session from 'express-session';

import * as mongoConnection from './controllers/dbConnection.js';
import authRouter from './routers/auth.js';
import userRouter from './routers/user.js';
import adminRouter from './routers/admin.js';
import publicRouter from './routers/public.js';
import driverRouter from './routers/driver.js';

import * as errorMongooseHandler from './middleware/errorMongooseHandler.js';
import * as errorHandlers from './middleware/errorHandlers.js';

// Connect to MongoDB
await mongoConnection.connectToDB();

const app = express();

const sessionStore = new session.MemoryStore();

// Register view engine
app.set('view engine', 'ejs');
// DO NOT RENAME THE VIEWS FOLDER

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'MSSV2210736',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    rolling: true,
    cookie: { maxAge: 1 * 60 * 60 * 1000}
}));

// Static files
app.use(express.static('./public'));

// Routers
app.use('/auth', authRouter);
app.use('/', publicRouter);
app.use('/driver', driverRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Error handler middlewares
app.use(Object.values(errorMongooseHandler));
app.use(Object.values(errorHandlers));

app.listen(7777);