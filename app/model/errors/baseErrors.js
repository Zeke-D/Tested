'use strict';

class AppError extends Error {
    constructor(message, options={}) {
        super(message);
        for (const [key, value] of Object.entries(options)) {
            this[key] = value;
        }
    }
    
    get name() {
        return this.constructor.name;
    }

    get statusCode() {
        return 500;
    }
}

class DBError extends AppError { }

class UserFacingError extends AppError { }

module.exports = {
    AppError,
    DBError,
    UserFacingError
}