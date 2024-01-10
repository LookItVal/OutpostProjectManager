export class ValidationError extends Error {
    public name: string;
    
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}