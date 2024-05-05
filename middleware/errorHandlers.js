// Catch all errors
export const logErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    // res.status(500).json({success: false, status: 500, message: err.message});
    return res.render('error', {status : 500, message : 'Internal Server Error'});
}
