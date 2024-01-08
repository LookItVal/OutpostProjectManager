export class ValidationError extends Error {
    public name: string;
    public message: string;
    
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}