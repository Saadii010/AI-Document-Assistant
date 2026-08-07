import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { connectDB } from '../config/db';
import { logger } from '../utils/logger';
import UserModelRaw from '../models/user.model';
import { ApplicationSettingsModel as ApplicationSettingsRaw } from '../models/applicationSettings.model';
import { PricingPlansModel as PricingPlansRaw } from '../models/pricingPlans.model';
import { FaqModel as FaqRaw } from '../models/faq.model';
import { TestimonialsModel as TestimonialsRaw } from '../models/testimonials.model';

dotenv.config();

const UserModel: any = UserModelRaw;
const ApplicationSettingsModel: any = ApplicationSettingsRaw;
const PricingPlansModel: any = PricingPlansRaw;
const FaqModel: any = FaqRaw;
const TestimonialsModel: any = TestimonialsRaw;

async function seed() {
  logger.info('Initializing Database Seeder...');
  await connectDB();

  try {
    // 1. Seed Users
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      logger.info('Seeding default users...');
      
      const adminHash = await bcryptjs.hash('AdminPass123!', 10);
      const userHash = await bcryptjs.hash('UserPass123!', 10);

      await UserModel.create([
        {
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@example.com',
          passwordHash: adminHash,
          role: 'admin',
          isVerified: true,
          isActive: true,
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'user@example.com',
          passwordHash: userHash,
          role: 'user',
          isVerified: true,
          isActive: true,
        }
      ]);
      logger.info('Successfully seeded Admin (admin@example.com) and User (user@example.com).');
    } else {
      logger.info('Users collection already has documents. Skipping users seeding.');
    }

    // 2. Seed Application Settings
    if (ApplicationSettingsModel) {
      const settingsCount = await ApplicationSettingsModel.countDocuments();
      if (settingsCount === 0) {
        logger.info('Seeding default system settings...');
        await ApplicationSettingsModel.create({
          systemName: 'AI Personal Knowledge Assistant',
          maintenanceMode: false,
          allowSignups: true,
          maxUploadSizeMb: 50,
          supportedExtensions: ['.pdf', '.txt', '.md', '.docx', '.pptx'],
          aiSettings: {
            preferredModel: 'gemini-1.5-flash',
            temperature: 0.3,
            maxTokens: 2048,
          },
        });
        logger.info('Successfully seeded default application settings.');
      }
    }

    // 3. Seed Pricing Plans
    if (PricingPlansModel) {
      const planCount = await PricingPlansModel.countDocuments();
      if (planCount === 0) {
        logger.info('Seeding default pricing plans...');
        await PricingPlansModel.create([
          {
            name: 'Basic Free',
            price: 0,
            billingCycle: 'monthly',
            features: [
              'Up to 5 documents',
              'Max 10MB per upload',
              'Standard semantic search',
              'Basic AI Chat support'
            ],
            isPopular: false,
            ctaText: 'Get Started'
          },
          {
            name: 'Professional',
            price: 19,
            billingCycle: 'monthly',
            features: [
              'Unlimited documents',
              'Max 50MB per upload',
              'Deep RAG citations',
              'Priority embedding queue',
              'Advanced system monitoring access'
            ],
            isPopular: true,
            ctaText: 'Go Pro'
          }
        ]);
        logger.info('Successfully seeded default pricing plans.');
      }
    }

    logger.info('✓ Database seeding completed successfully.');
    process.exit(0);
  } catch (err: any) {
    logger.error('CRITICAL: Database seeding failed: %O', err);
    process.exit(1);
  }
}

seed();
