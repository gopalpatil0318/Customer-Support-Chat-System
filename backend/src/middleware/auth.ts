import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const authenticateToken = (req: any, res: any, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user as DecodedToken;
    next();
  });
};

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: any, next: NextFunction) => {
    if (!req.user) return res.sendStatus(401);
    if (!roles.includes(req.user.role)) return res.sendStatus(403);
    next();
  };
};