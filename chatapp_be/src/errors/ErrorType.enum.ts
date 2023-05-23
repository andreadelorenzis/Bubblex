export class ErrorType {
    static NOT_FOUND = new ErrorType('NotFoundError');
    static SYNTAX_ERROR = new ErrorType('SyntaxError');
    static VALIDATION_ERROR = new ErrorType('ValidationError');
    static SERVER_ERROR = new ErrorType('ServerError');
    static USER_ALREADY_EXISTS = new ErrorType('UserAlreadyExistsError');

    readonly name: string;

    private constructor(name: string) {
        this.name = name;
    }
}
