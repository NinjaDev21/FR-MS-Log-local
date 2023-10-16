/**
 * Not Found 
 * Use it when expected resource 
 * or object does not exist
 * @param
 * @returns NotFound
 */
class NotFound extends Error {
    constructor(message) {
        super(message)
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name
        this.message = "Not found"
        this.status = 404
    }

    statusCode() {
        return this.status
    }
}

/**
 * Unauthorized
 * Use it when request is not authorized 
 * to perform the expected action
 * @param string message
 */
class Unauthorized extends Error {
    constructor(message) {
        super(message)
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name
        this.status = 401
    }

    statusCode() {
        return this.status
    }
}

/**
 * Invalid Request 
 * Use it only when request is okay but unable to process the instruction 
 * try to avoid this and use Bad Request instead 
 * @param string message
 * @returns InvalidRequest 
 */
class InvalidRequest extends Error {
    constructor(message) {
        super(message)
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name
        this.status = 422
    }

    statusCode() {
        return this.status
    }
}
/**
 * Bad Request
 * use it for syntactical error in payload or validation failed
 * @param string message
 * @returns BadRequest 
 */
class BadRequest extends Error {
    constructor(message) {
        super(message)
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name
        this.status = 400
    }

    statusCode() {
        return this.status
    }
}

module.exports = {
    NotFound : NotFound,
    InvalidRequest: InvalidRequest,
    Unauthorized: Unauthorized,
    BadRequest: BadRequest
}