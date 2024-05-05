import models from '../model/models.js';
import * as random from '../util/randomGen.js';

export const driverFactory = async () => {

    const inp = {
        username: random.randomUsername(),
        password: random.randomPassword(),
        accountType: 'Driver',

        name: random.randomName(),
        email: random.randomEmail(),
        phoneNumber: random.randomPhone(),
        age: random.randomIntFromInterval(18, 60),
        licenseType: random.randFromArray(['Truck', 'Car', 'Container']),
        employeeID: random.randomID(),
    }


    try {
        const driverProfile = new models.Driver(inp);
        const driverAccount = new models.Account(inp);
        await driverProfile.validate();
        await driverAccount.validate();
        await driverProfile.save();
        driverAccount.profile = driverProfile._id;
        await driverAccount.save();
    }
    catch (err) {
        console.error('Something went wrong',err);
    }
}