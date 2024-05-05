import models from '../model/models.js';
import * as random from '../util/randomGen.js';

export const customerFactory = async () => {

    const inp = {
        username: random.randomUsername(),
        password: random.randomPassword(),
        accountType: 'Customer',

        name: random.randomName(),
        email: random.randomEmail(),
        phoneNumber: random.randomPhone(),
    };
    
    try {
        const customerProfile = new models.Customer(inp);
        const customerAccount = new models.Account(inp);
        await customerProfile.validate();
        await customerAccount.validate();
        await customerProfile.save();
        customerAccount.profile = customerProfile._id;
        await customerAccount.save();
    }
    catch (err) {
        console.error(err.message,err.stack);
    }
}
