import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planType, charityId } = req.body;
    const userId = req.user.id;

    if (!['monthly', 'yearly'].includes(planType)) {
      res.status(400).json({ error: 'Invalid plan type' });
      return;
    }

    if (!charityId) {
       res.status(400).json({ error: 'Please select a charity' });
       return;
    }

    db.prepare("UPDATE users SET subscription_status = 'active', charity_id = ? WHERE id = ?").run(charityId, userId);

    const endDate = new Date();
    if (planType === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    if (planType === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);

    const subId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_type, status, stripe_subscription_id, start_date, end_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(subId, userId, planType, 'active', 'sub_mock_12345', new Date().toISOString(), endDate.toISOString());

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);

    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1').get(userId, 'active') as any;

    if (!subscription) {
       res.json({ isActive: false });
       return;
    }

    const start_date = subscription.start_date;
    const end_date = subscription.end_date;
    const plan_type = subscription.plan_type;

    const userDetails = db.prepare(`
      SELECT u.subscription_status, c.name, c.description 
      FROM users u 
      LEFT JOIN charities c ON u.charity_id = c.id 
      WHERE u.id = ?
    `).get(userId) as any;

    const responseSub = {
      ...subscription,
      users: {
        subscription_status: userDetails.subscription_status,
        charities: {
          name: userDetails.name,
          description: userDetails.description
        }
      }
    };

    res.json({ isActive: true, subscription: responseSub });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const getCharities = async (req: AuthRequest, res: Response): Promise<void> => {
   try {
     const charities = db.prepare('SELECT * FROM charities').all();
     res.json({ charities });
   } catch (err: any) {
     res.status(500).json({ error: 'Server error' });
   }
};
