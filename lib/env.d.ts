// This file provides type declarations for the env module
declare module '@/lib/env' {
  export const env: {
    NODE_ENV: 'development' | 'test' | 'production';
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    
    // Database
    DATABASE_URL: string;
    
    // Authentication
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    
    // Stripe
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID?: string;
    NEXT_PUBLIC_STRIPE_PRO_PRICE_ID?: string;
    
    // Other environment variables
    SITE_NAME: string;
    SITE_URL: string;
  };
}
