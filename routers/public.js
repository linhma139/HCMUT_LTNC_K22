import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.user) {
        if(req.session.accountType  === 'Customer') {
            return res.redirect('/user');
        }
        else if(req.session.accountType  === 'Admin') {
            return res.redirect('/admin');
        }
        else if(req.session.accountType  === 'Driver') {
            return res.redirect('/driver');
        }
    }
    res.render('index');
});



export default router;