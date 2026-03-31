import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

export const addScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { score, date } = req.body;
    const userId = req.user.id;

    if (typeof score !== 'number' || score < 1 || score > 45) {
      res.status(400).json({ error: 'Score must be between 1 and 45' });
      return;
    }

    if (!date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    const scores = db.prepare('SELECT id, score, date FROM scores WHERE user_id = ? ORDER BY date ASC').all(userId) as any[];

    // Rule: Only 5 scores stored. New score -> oldest removed.
    if (scores && scores.length >= 5) {
      const oldestScoreId = scores[0].id;
      db.prepare('DELETE FROM scores WHERE id = ?').run(oldestScoreId);
    }

    const id = crypto.randomUUID();
    db.prepare('INSERT INTO scores (id, user_id, score, date) VALUES (?, ?, ?, ?)')
      .run(id, userId, score, date);

    const newScore = db.prepare('SELECT * FROM scores WHERE id = ?').get(id);

    res.status(201).json({ message: 'Score added successfully', score: newScore });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const getScores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const scores = db.prepare('SELECT * FROM scores WHERE user_id = ? ORDER BY date DESC').all(userId);

    res.json({ scores });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
