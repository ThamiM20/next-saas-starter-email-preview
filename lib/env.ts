import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: z.string().optional(),
  
  // Other environment variables
  SITE_NAME: z.string().default('Next.js SaaS Starter'),
  SITE_URL: z.string().url().default('http://localhost:3000'),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

// Validate environment variables at startup
try {
  envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingEnvs = error.errors
      .map((e) => e.path.join('.'))
      .join('\n  - ');
    
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Invalid environment variables:', error.errors);
      process.exit(1);
    } else {
      console.warn('⚠️ Missing or invalid environment variables:');
      console.warn(`  - ${missingEnvs}`);
      console.warn('Continuing with default values...');
    }
  }
}

// Export validated environment variables
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Authentication
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  
  // Other environment variables
  SITE_NAME: process.env.SITE_NAME || 'Next.js SaaS Starter',
  SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
} as const;
