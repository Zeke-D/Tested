const { UserFacingError } = require("./baseErrors");

class BadRequestError extends UserFacingError {
    get statusCode() {
        return 400;
    }
}

class NotFoundError extends UserFacingError {
    get statusCode() {
        return 404;
    }
}