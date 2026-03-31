import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if first user -> make admin
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const isAdmin = userCount === 0 ? 1 : 0;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = crypto.randomUUID();

    try {
      db.prepare('INSERT INTO users (id, name, email, password, is_admin) VALUES (?, ?, ?, ?, ?)')
        .run(id, name, email, hashedPassword, isAdmin);
    } catch (dbErr: any) {
      if (dbErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
         res.status(400).json({ error: 'Email already exists' });
         return;
      }
      throw dbErr;
    }

    const newUser = db.prepare('SELECT id, name, email, is_admin FROM users WHERE id = ?').get(id) as any;
    const token = jwt.sign({ id: newUser.id, role: newUser.is_admin ? 'admin' : 'user' }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
       res.status(400).json({ error: 'Invalid credentials' });
       return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       res.status(400).json({ error: 'Invalid credentials' });
       return;
    }

    const token = jwt.sign({ id: user.id, role: user.is_admin ? 'admin' : 'user' }, JWT_SECRET, { expiresIn: '1d' });

    const userSafe = { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin === 1 };
    res.json({ token, user: userSafe });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user) {
    const userSafe = { ...req.user, is_admin: req.user.is_admin === 1 };
    delete userSafe.password;
    res.json({ user: userSafe });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
