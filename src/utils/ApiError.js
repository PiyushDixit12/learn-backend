class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went Wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;
        console.log("message is ",this.message)
        this.message = message;

        if(stack?.length) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this,this.constructor);
        }

    }
}

export {ApiError}