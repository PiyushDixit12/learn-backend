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

        if(stack?.length) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this,this.constructor);
        }

    }
}