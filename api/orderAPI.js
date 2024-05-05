
const geocodeAPIkey = process.env.GEOCODE_API_KEY;
const rapidAPIkey = process.env.X_RAPIDAPI_KEY;

const transformLocation = (location) => {
    return {
        apikey: geocodeAPIkey,
        postaladdress: location.street + ' St',
        city: location.city,
        state: location.province,
        country: 'Vietnam',
    }
}

export const getCoord = async (location) => {
    // return random coord for now
    const url = 'https://geocod.xyz/api/public/getCoords?' + new URLSearchParams(transformLocation(location)).toString();
    const response = await fetch(url);
    console.log(url)

    console.log(response);

    const result = await response.json();

    console.log(result)

    return [result.lat,result.lon]
}

export const getDistDur = async (coord1, coord2) => {
    const truewayurl = 'https://trueway-directions2.p.rapidapi.com/FindDrivingPath?' + new URLSearchParams({
        origin: coord1.join(','),
        destination: coord2.join(','),
    }).toString();

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': rapidAPIkey,
            'X-RapidAPI-Host': 'trueway-directions2.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(truewayurl, options);
        const result = await response.json();
    
        return [result.route.distance, result.route.duration];
    } catch (err) {
        console.error(err.message, err.stack);
    }
}

