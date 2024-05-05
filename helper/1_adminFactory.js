import mongoose from 'mongoose';
import models from '../model/models.js';
import * as random from '../util/randomGen.js';

export const adminFactory = async () => {

    const inp = {
        username: random.randomUsername(),
        password: random.randomPassword(),
        accountType: 'Admin',

        name: random.randomName(),
        email: random.randomEmail(),
        phoneNumber: random.randomPhone(),
        adminID: random.randomID(),
    };
    
    try {
        const adminProfile = new models.Admin(inp);
        const adminAccount = new models.Account(inp);
        await adminProfile.validate();
        await adminAccount.validate();
        await adminProfile.save();
        adminAccount.profile = adminProfile._id;
        await adminAccount.save();
    }
    catch (err) {
        console.error(err.message,err.stack);
    }
}
