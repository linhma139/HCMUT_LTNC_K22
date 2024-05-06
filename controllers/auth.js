import mongoose from 'mongoose';
import models from '../model/models.js';

// DEPLOYMENT: Domain is changed later
const clearCookie = (req,res) => {
    try {
        res.clearCookie('connect.sid', { path: '/' , Domain: 'localhost'});
        req.session.destroy();
    } 
    catch (err) {
        throw err;
    }
}

const assignSession = (req,account) => {
    req.session.user = account._id;
    req.session.username = account.username;
    req.session.profile = account.profile;
    req.session.accountType = account.accountType;
}

export const registerView = (req,res,next) => {
    if (req.session.user) {
        return res.status(400).json({ success: false, status: 400, message: 'Already logged in'});
    }
    /* render view here */
    return res.render("register")
};

export const loginView = (req,res,next) => {
    if (req.session.user) {
        return res.status(400).json({ success: false, status: 400, message: 'Already logged in'});
    }
    /* render view here */
    return res.render("login")
};

export const logoutView = (req,res,next) => {
    // if (req.session.user) {
    //     return res.status(400).json({ success: false, status: 400, message: 'Already logged in'});
    // }
    return res.render("logout")
    /* render view here */
};

export const registerUser = async (req,res,next) => {
    if (req.session.user) {
        return res.status(400).json({ success: false, status: 400, message: 'Already logged in'});
    }

    try {
        req.body.accountType = 'Customer';
        const account = await models.Account.createAccount(req.body);
        assignSession(req,account);
        if(req.session.accountType === 'Customer') {
            res.redirect('/user');
        }
        if(req.session.accountType === 'Admin') {
            res.redirect('/admin');
        }  
        else { 
            res.redirect('/driver');
        }
        
        // return res.status(201).json({ success: true, status: 201, message: 'Succesfully registered', data: {username: req.session.username}});
    }
    catch (err) {
        next(err);
    }
};

export const loginUser = async (req,res,next) => {
    if (req.session.user) {
        return res.status(400).json({ success: false, status: 400, message: "Already logged in"});
    }

    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ success: false, status: 400, message: "Missing username or password"});
    }

    try{
        const password = req.body.password;
        const username = req.body.username;
        const account = await models.Account.findOne({username: req.body.username}).exec();

        if (!account || account.verifyAccount(username, password) == false) {
            return res.status(400).json({ success: false, status: 400, message: "Incorrect username or password"});
        }
        else {
            assignSession(req,account);
            if(req.session.accountType === 'Customer') {
                res.redirect('/user');
            }
            if(req.session.accountType === 'Admin') {
                res.redirect('/admin');
            }  
            else { 
                res.redirect('/driver');

            // return res.status(200).json({ success: true, status: 200, message: "Successfully logged in", data: {username: req.body.username}});
            }
        }
    }
    catch(err) {
        next(err);
    }
};

export const logoutUser = (req,res,next) => {
    try {
        clearCookie(req,res);
        return res.status(200).json({ success: true, status: 200, message: "Successfully logged out"});
    } catch(err) {
        next(err);
    }
};

export const deleteUser = async (req,res,next) => {
    if (req.session.accountType !== 'Customer') {
        return res.status(400).json({ success: false, status: 400, message: 'Permission level not allowed'});
    }

    if (!req.body.password) {
        return res.status(400).json({ success: false, status: 400, message: "Missing password"});
    }

    try {
        const account = await models.Account.findById(req.session.user).exec();
        if (!account) {
            return res.status(400).json({ success: false, status: 400, message: "Account not found"});
        }

        const verified = account.verifyAccount(req.session.username, req.body.password);
        if (verified == false) {
            return res.status(400).json({ success: false, status: 400, message: "Incorrect password"});
        }

        await account.deleteAccount();
        clearCookie(req,res);
        return res.status(200).json({ success: true, status: 200, message: "Successfully deleted account"});
    }
    catch(err) {
        next(err);
    }
};
