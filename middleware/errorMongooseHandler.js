import mongoose from 'mongoose';

// Validation error
export const mongooseValidationError = (err, req, res, next) => {
    if (err instanceof mongoose.Error.ValidationError) {
        let data = {};

        Object.keys(err.errors).forEach(key => {
            data[key] = err.errors[key].message;
        })

        res.status(400).json({
            success: false,
            status: 400,
            message: 'Validation error',
            data: data
        });
        res.end();
    }
    else {
        next(err);
    }
}

// Duplicate key error
export const mongooseDuplicateKeyError = (err, req, res, next) => {
    if (err.code == 11000) {
        let data = {};

        Object.keys(err.keyValue).forEach(key => {
            data[key] = 'Duplicated';
        })

        res.status(409).json({
            success: false,
            status: 409,
            message: 'Duplicated key error',
            data: data
        });
        res.end();
    }
    else {
        next(err);
    }
}