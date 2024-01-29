import mongoose from 'mongoose';
import dotenv from 'dotenv';
import type { Request } from 'express';
import type { RequireAuthProp } from '@clerk/clerk-sdk-node';
import type { ConnectOptions } from 'mongoose';
dotenv.config();

export const connectTestsToMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      useNewUrlParser: true,
    } as ConnectOptions);
  } catch (error) {
    console.error(error);
  }
};

export const getUserFromRequest = (req: RequireAuthProp<Request>) => {
  // for testing purposes
  if (process.env.ENVIRONMENT === 'test') {
    const role = req.headers.role as string;
    const email = req.headers.email || 'test@test.com';

    return { role, email };
  }

  // for everything else
  const role = (req.auth as any).sessionClaims.publicMetadata.role;
  const email = (req.auth as any).sessionClaims.email;

  return { role, email };
};
