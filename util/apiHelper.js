const truckPrice = {
    'Small': 500,
    'Medium': 1000,
    'Large': 1500
}

export const containerLookup = {
    'ĐH Bách Khoa TPHCM Cơ Sở 2' : [10.880559,106.805377],
    'ĐH Bách Khoa TPHCM Cơ Sở 1' : [ 10.773247,106.659766 ],
    'ĐH Bách Khoa Đà Nẵng' : [20.966558,105.788437],
    'ĐH Bách Khoa Hà Nội' : [21.007296,105.842644 ]
}

// kVND
export const getPrice = {
    'Car': ({ timeFrom, timeTo, distance}) => {
        return 5 + 10 * distance / 1000 + 2 * (timeTo - timeFrom) / (60 * 1000);
    },
    'Truck': ({ distance , spec : { size }}) => {
        return 10 * distance / 1000 + 500 + truckPrice[size] * 0.1;
    },
    'Container': ({ timeFrom, timeTo, distance}) => {
        return 500 + 10 * distance / 1000 + 2 * (timeTo - timeFrom) / (60 * 1000);
    }
}