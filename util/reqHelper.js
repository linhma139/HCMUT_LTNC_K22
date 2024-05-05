export const toNumProperties = (properties,obj) => {
    if (properties === undefined || !(properties instanceof Array)) return;
    if (obj === undefined) return;

    properties.forEach((key) => {
        if (!obj[key]) return;
        if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map((item) => parseInt(item,10));
        } else {
            obj[key] = parseInt(obj[key],10);
        }
    });
};

export const filterProperties = (properties,obj) => {
    if (properties === undefined || !(properties instanceof Array)) return;
    if (obj === undefined) return;

    for (let key in obj) {
        if (!properties.includes(key)) {
            delete obj[key];
        }
    }
};

export const removeUndefinedProperties = (obj) => {
    if (obj === undefined) return;

    for (let key in obj) {
        if (obj[key] === undefined || obj[key] === '') {
            delete obj[key];
        }
        else if (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0) {
            delete obj[key];
        }
    }
}

export const removeInvalidSortOptions = (sortOptions) => {
    if (sortOptions === undefined) return;

    for (let key in sortOptions) {
        if (sortOptions[key] !== '1' && sortOptions[key] !== '-1') {
            if (Object.keys(sortOptions).length <= 1) sortOptions[key] = '-1';
            else delete sortOptions[key];
        }
        if (sortOptions[key]) sortOptions[key] = parseInt(sortOptions[key],10);
    }
}