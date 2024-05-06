import models from '../model/models.js';
import * as random from '../util/randomGen.js';

const specGen = {
    "Car": () => {
        return {
            seats: random.randomIntFromInterval(2, 7),
            bags: random.randomIntFromInterval(1, 3),
        }
    },

    "Truck": () => {
        return {
            size: random.randFromArray(['Small', 'Medium', 'Large']),
        }
    },

    "Container": () => {
        return {
            size: random.randFromArray(['20', '40']),
        }
    }
}

const constructor = {
    "Car": (inp) => models.Car(inp),
    "Truck": (inp) => models.Truck(inp),
    "Container": (inp) => models.Container(inp)
}

const location = [
    {name: 'ĐH Bách Khoa TPHCM Cơ Sở 2' , coord: [10.880559,106.805377]},
    {name: 'ĐH Bách Khoa TPHCM Cơ Sở 1' , coord: [ 10.773247,106.659766 ]},
    {name: 'ĐH Bách Khoa Đà Nẵng' , coord: [20.966558,105.788437]},
    {name: 'ĐH Bách Khoa Hà Nội' , coord: [21.007296,105.842644 ]}
]

const comment = [
    'Tuyệt vời',
    'Rất tốt',
    'Tạm được',
    'Kém',
    'Rất kém'
]

export const vehicleFactory = async () => {
    const inp = {
        type: random.randFromArray(['Car', 'Truck', 'Container']),
        fuelType: random.randFromArray(['Gasoline', 'Diesel', 'Electricity']),
        numberPlate: random.randomID()
    }
    inp.spec = specGen[inp.type]();

    try {
        const vehicle = await constructor[inp.type](inp).save();
        await vehicle.assignBestDriver();
        if (!vehicle.driver) return;
        await vehicle.initEvent(random.randLongLat());

        let timeStart = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

        for (let i = 0; i < 10; i++) {
            let loc1 = location[i%4];
            let loc2 = location[(i+1)%4];

            const event = {
                eventType: random.randFromArray(['Maintainance', 'In-use', 'Not available']),
                timeFrom: timeStart, 
                timeTo: new Date(timeStart.getTime() + random.randomIntFromInterval(2, 10) * 24 * 60 * 60 * 1000),
                coordFrom: loc1.coord,
                coordTo: loc2.coord
            }

            if (event.eventType === 'In-use') {
                const ord = {
                    locationFrom: {
                        street: random.randomID(),
                        city: 'Ho Chi Minh',
                        district: random.randomID(),
                        province: 'Ho Chi Minh'
                    },
                    locationTo: {
                        street: random.randomID(),
                        city: 'Ho Chi Minh',
                        district: random.randomID(),
                        province: 'Ho Chi Minh'
                    },
                    timeFrom: event.timeFrom,
                    timeTo: event.timeTo,
                    customer: (await models.Customer.findOne().skip(random.randomIntFromInterval(0,4)).exec())._id,
                    vehicle: vehicle._id,
                    driver: vehicle.driver?._id,
                    price: random.randomIntFromInterval(100, 800),
                    distance: random.randomIntFromInterval(10000, 30000)
                }

                const order = new models.Order(ord);
                await order.save();
                event.order = order._id;

                if (event.timeTo < new Date(Date.now())) {
                    const review = models.Review({
                        driver: vehicle.driver._id,
                        customer: ord.customer,
                        order: order._id,
                        comment: random.randFromArray(comment),
                        rating: random.randomIntFromInterval(0,5)
                    });
                    await review.save();
                }
            }
            
            await vehicle.createEvent(event);
            timeStart = new Date(event.timeTo + random.randomIntFromInterval(1, 5) * 24 * 60 * 60 * 1000);
        }
    }
    catch (err) {
        console.error('Something went wrong',err);
    }
}