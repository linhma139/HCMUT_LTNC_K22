export function checkRequiredKeys(object, keys) {
    for (const key of keys) {
        if (!object[key]) return key;
    }
    return true;
}