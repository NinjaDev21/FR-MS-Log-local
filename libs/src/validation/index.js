'use strict'
const ObjectID = require("bson-objectid");
module.exports = {
    email: (value) => {
        const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(value);
    },
    number: (value) => {
        const regex = /^\d+(\.\d{1,2})?$/;
        return regex.test(value);
    },
    alphaNumeric: (value) => {
        const regex = /^[A-Za-z0-9 ]+$/;
        return regex.test(value);
    },
    alpha: (value) => {
        const regex = /^[A-Za-z ]+$/;
        return regex.test(value);
    },
    objectID: (objectid) => {
        return ObjectID.isValid(objectid);
    }
}