import Randexp from "randexp";
import regex from "./regex.js";

export const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const randomFloatFromInterval = (min, max) => {
    return Math.random() * (max - min) + min;
}

export const randomUsername = () => {
    return new Randexp(regex.usernameRegex).gen();
}

export const randomID = () => {
    return new Randexp(regex.idRegex).gen();
}

export const randomEmail = () => {
    return randomID() + '@gmail.com';
}

export const randomPassword = () => {
    return new Randexp(regex.passwordRegex).gen().substring(0, 8);
}

export const randomPhone = () => {
    return new Randexp(regex.phoneRegex).gen();
}

export const randomName = () => {
    const ho = ['Nguyễn','Phạm','Lê','Mã','Quách','Đỗ','Quốc'];
    const tenDem = ['Thị', 'Hải', 'Hoàng', 'Linh', 'Tuấn', 'Tất'];
    const ten = ['Anh', 'Huy', 'Duy', 'Hà', 'Hải', 'Hùng', 'Hưng', 'Linh', 'Minh'];
    return `${ho[Math.floor(Math.random() * ho.length)]} ${tenDem[Math.floor(Math.random() * tenDem.length)]} ${ten[Math.floor(Math.random() * ten.length)]}`;
}

export const randFromArray = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

export const randLongLat = () => {
    return [randomFloatFromInterval(100.7, 120.9), randomFloatFromInterval(106.6, 116.9)];
}