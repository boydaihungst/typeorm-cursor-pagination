"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function atob(value) {
    return Buffer.from(value, 'base64').toString();
}
exports.atob = atob;
function btoa(value) {
    return Buffer.from(value).toString('base64');
}
exports.btoa = btoa;
function encodeByType(type, value) {
    if (value === null)
        return null;
    switch (type) {
        case 'date': {
            return value.getTime().toString();
        }
        case 'number': {
            return `${value}`;
        }
        case 'string': {
            return encodeURIComponent(value);
        }
        default: {
            throw new Error(`unknown type in cursor: [${type}]${value}`);
        }
    }
}
exports.encodeByType = encodeByType;
function decodeByType(type, value) {
    switch (type) {
        case 'date': {
            const timestamp = parseInt(value, 10);
            if (Number.isNaN(timestamp)) {
                throw new Error('date column in cursor should be a valid timestamp');
            }
            return new Date(timestamp);
        }
        case 'number': {
            const num = parseInt(value, 10);
            if (Number.isNaN(num)) {
                throw new Error('number column in cursor should be a valid number');
            }
            return num;
        }
        case 'string': {
            return decodeURIComponent(value);
        }
        default: {
            throw new Error(`unknown type in cursor: [${type}]${value}`);
        }
    }
}
exports.decodeByType = decodeByType;
function stringToBool(value) {
    return value === 'true';
}
exports.stringToBool = stringToBool;
function stringToNumber(value) {
    const result = parseInt(value, 10);
    if (Number.isNaN(result)) {
        return 0;
    }
    return result;
}
exports.stringToNumber = stringToNumber;
function camelOrPascalToUnderscore(str) {
    return str
        .split(/(?=[A-Z])/)
        .join('_')
        .toLowerCase();
}
exports.camelOrPascalToUnderscore = camelOrPascalToUnderscore;
function pascalToUnderscore(str) {
    return camelOrPascalToUnderscore(str);
}
exports.pascalToUnderscore = pascalToUnderscore;
//# sourceMappingURL=utils.js.map