import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

export const runDraw = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const month = new Date().toISOString().slice(0, 7); // '2023-10'

    const existingDraw = db.prepare('SELECT * FROM draws WHERE month = ?').get(month);

    if (existingDraw) {
      res.status(400).json({ error: 'Draw already ran for this month', draw: existingDraw });
      return;
    }

    // Generate 5 random winning numbers (1-45)
    let numbersGenerated: number[] = [];
    while(numbersGenerated.length < 5) {
      const r = Math.floor(Math.random() * 45) + 1;
      if (!numbersGenerated.includes(r)) numbersGenerated.push(r);
    }
    numbersGenerated.sort((a,b) => a-b);

    const drawId = crypto.randomUUID();
    db.prepare('INSERT INTO draws (id, month, numbers_generated, status) VALUES (?, ?, ?, ?)')
      .run(drawId, month, JSON.stringify(numbersGenerated), 'pending');
    
    const activeUsersResult = db.prepare('SELECT COUNT(*) as activeUsers FROM users WHERE subscription_status = ?').get('active') as any;
    const activeUsers = activeUsersResult.activeUsers || 0;

    const totalSubRevenue = activeUsers * 50; 
    const charityPool = totalSubRevenue * 0.10;
    const prizePool = totalSubRevenue - charityPool;
    
    const pot5 = prizePool * 0.40;
    const pot4 = prizePool * 0.35;
    const pot3 = prizePool * 0.25;

    // Get active users and their scores
    const activeUsersList = db.prepare('SELECT id, name FROM users WHERE subscription_status = ?').all('active') as any[];
    
    interface MatchResult {
      userId: string;
      matchCount: number;
    }
    const winners: MatchResult[] = [];
    let count5 = 0; let count4 = 0; let count3 = 0;

    activeUsersList.forEach(user => {
      const userScores = db.prepare('SELECT score FROM scores WHERE user_id = ?').all(user.id) as any[];
      if (!userScores || userScores.length === 0) return;
      
      const userNumbers = userScores.map(s => s.score);
      let matches = 0;
      userNumbers.forEach((num: number) => {
         if (numbersGenerated.includes(num)) matches++;
      });

      if (matches >= 3) {
        winners.push({ userId: user.id, matchCount: matches });
        if (matches === 5) count5++;
        if (matches === 4) count4++;
        if (matches === 3) count3++;
      }
    });

    const currentPayouts: any[] = [];
    
    winners.forEach(w => {
      let amount = 0;
      let matchType = '';
      if (w.matchCount === 5) { amount = pot5 / count5; matchType = '5_match'; }
      if (w.matchCount === 4) { amount = pot4 / count4; matchType = '4_match'; }
      if (w.matchCount === 3) { amount = pot3 / count3; matchType = '3_match'; }

      currentPayouts.push([
        crypto.randomUUID(),
        drawId,
        w.userId,
        matchType,
        amount,
        'pending'
      ]);
    });

    if (currentPayouts.length > 0) {
      const insertWinner = db.prepare('INSERT INTO winners (id, draw_id, user_id, match_type, prize_amount, status) VALUES (?, ?, ?, ?, ?, ?)');
      const insertMany = db.transaction((payouts) => {
        for (const payout of payouts) insertWinner.run(...payout);
      });
      insertMany(currentPayouts);
    }

    db.prepare("UPDATE draws SET status = 'completed' WHERE id = ?").run(drawId);
    const drawRecord = db.prepare('SELECT * FROM draws WHERE id = ?').get(drawId);

    res.json({
      message: 'Draw ran successfully',
      draw: drawRecord,
      stats: {
        totalRevenue: totalSubRevenue,
        charityPool,
        prizePool,
        winnersFound: winners.length,
        potDetails: {
          jackpot: { total: pot5, winners: count5, payoutPerWinner: count5 > 0 ? pot5/count5 : 0, rollover: count5 === 0 },
          pot4: { total: pot4, winners: count4, payoutPerWinner: count4 > 0 ? pot4/count4 : 0 },
          pot3: { total: pot3, winners: count3, payoutPerWinner: count3 > 0 ? pot3/count3 : 0 }
        }
      }
    });

  } catch (err: any) {
    res.status(500).json({ error: 'Server error during draw execution', details: err.message });
  }
};

export const getDrawHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drawsRaw = db.prepare('SELECT * FROM draws ORDER BY created_at DESC').all() as any[];
    const draws = drawsRaw.map(d => ({ ...d, numbers_generated: parseSafe(d.numbers_generated) }));

    const getWins = db.prepare(`
      SELECT w.*, d.month as draw_month, d.numbers_generated 
      FROM winners w 
      JOIN draws d ON w.draw_id = d.id 
      WHERE w.user_id = ?
    `);
    const myWinsRaw = getWins.all(req.user.id) as any[];
    const myWins = myWinsRaw.map(w => ({
      ...w,
      draws: { month: w.draw_month, numbers_generated: parseSafe(w.numbers_generated) }
    }));

    res.json({ draws, myWins });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

function parseSafe(str: string) {
  try { return JSON.parse(str); } catch { return []; }
}
