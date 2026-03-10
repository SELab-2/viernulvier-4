import { HttpException, HttpStatus } from '@nestjs/common';

// 410 Gone for resources not found
export class ResourceGoneException extends HttpException {
    constructor(message: string = 'Resource is gone') {
        super(message, HttpStatus.GONE);
    }
}

// 418 I'm a teapot easter egg
export class TeapotException extends HttpException {
    constructor() {
        super("I'm a teapot", HttpStatus.I_AM_A_TEAPOT);
    }
}