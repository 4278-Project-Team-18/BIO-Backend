import Admin from '../models/admin.model';
import type { Request, Response } from 'express';

export const createAdmin = async (req: Request, res: Response) => {
  const admin = req.body;

  const newAdmin = new Admin(admin);

  try {
    await newAdmin.save();

    return res.status(201).json(newAdmin);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
