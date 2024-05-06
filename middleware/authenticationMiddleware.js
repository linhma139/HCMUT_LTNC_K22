import express from 'express';
import session from 'express-session';
import Account from '../model/accounts/Account.js';
import mongoose from 'mongoose';

export const isAdmin = async (req, res, next) =>
{
    if (req.session.accountType !== 'Admin')
    {
        // return res.status(401).json({ success: false, status: 401, message: 'Unauthorized' });
        return res.render('error', {status: 401, message: 'Unauthorized'});
    }
    else {
        const userid = req.session.user;
        const admin = await Account.findById(userid, 'accountType').exec();
        if (!admin || admin.accountType !== 'Admin') {
            // return res.status(401).json({ success: false, status: 401, message: 'Unauthorized' });
            return res.render('error', {status: 401, message: 'Unauthorized'});
        }
        next();
    }
}

export const isDriver = async (req,res,next) => {
    if (req.session.accountType !== 'Driver')
    {
        // return res.status(401).json({ success: false, status: 401, message: 'Unauthorized' });
        return res.render('error', {status: 401, message: 'Unauthorized'});
    }
    else {
        const userid = req.session.user;
        const driver = await Account.findById(userid, 'accountType').exec();
        if (!driver || driver.accountType !== 'Driver') {
            // return res.status(401).json({ success: false, status: 401, message: 'Unauthorized' });
            return res.render('error', {status: 401, message: 'Unauthorized'});
        }
        next();
    }
}

export const isLoggedIn = async (req, res, next) => {
    if (!req.session.user || !req.session.accountType) {
        // return res.status(401).json({ success: false, status: 401, message: 'Not logged in' });
        return res.redirect('/auth/login');
    }
    next();
}