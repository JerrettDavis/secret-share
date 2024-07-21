import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log('Request:', req.method, req.url);
    res.on('finish', () => {
        console.log('Response:', res.statusCode);
    });
    next();
};
