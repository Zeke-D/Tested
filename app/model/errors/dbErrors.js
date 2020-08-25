const { DBError } = require("./baseErrors");

class BadQueryError extends DBError {
    get statusCode() {
        return 422;
    }
}

class EntryAlreadyExistsError extends DBError {
    get statusCode() {
        return 400;
    }
}

// parse postgres error returned from queries
function parsePgError(err) {
    if (err.message.includes("unique")) {
        if (err.message.includes("user")) {
            return new EntryAlreadyExistsError("User with that email already exists.");
        }
    }
    else {
        return new DBError("Database could not parse request.");
    }
}

module.exports = {
    BadQueryError,
    EntryAlreadyExistsError,
    parsePgError
}