# Next.js Email Module

A comprehensive email solution for Next.js applications, featuring email forwarding, preview, and management capabilities.

## 🚀 Features

- **Email Dashboard** - Overview of email activities and quick actions
- **Email Preview** - Test and preview email templates across devices
- **Email Management** - View and manage all email communications
- **Email Forwarding** - Generate and manage forwarding email addresses
- **Template Testing** - Test responsive email designs

## 📦 Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Next.js 14+
- PostgreSQL (or your preferred database)
- Email service provider (Mailtrap, SendGrid, etc.)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/next-saas-starter-email-preview.git
   cd next-saas-starter-email-preview
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your configuration.

4. Set up the database:
   ```bash
   pnpm prisma migrate dev
   # or
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

## 🔧 Configuration

Update the following environment variables in your `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/email_db"

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Email Service
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@example.com

# Email Forwarding
EMAIL_FORWARDING_DOMAIN=yourdomain.com
```

## 🏗️ Project Structure

```
app/dashboard/email/
├── components/           # Shared UI components
│   ├── EmailTester.tsx  # Email testing component
│   └── ...
├── services/            # Business logic services
│   ├── emailService.ts
│   └── forwardingService.ts
├── types/               # TypeScript type definitions
│   └── email.ts
├── utils/               # Utility functions
│   └── emailParser.ts
├── dashboard/           # Email Management (FileText icon)
│   └── page.tsx         # List and manage all emails
├── preview/             # Email Preview (Mail icon)
│   └── page.tsx         # Preview and test emails
└── page.tsx             # Main Email Dashboard (LayoutDashboard icon)
```

```
app/dashboard/email/
├── components/           # Shared UI components
│   ├── EmailTester.tsx  # Email testing component
│   └── ...
├── services/            # Business logic services
│   ├── emailService.ts
│   └── forwardingService.ts
├── types/               # TypeScript type definitions
│   └── email.ts
├── utils/               # Utility functions
│   └── emailParser.ts
├── dashboard/           # Email Management (FileText icon)
│   └── page.tsx         # List and manage all emails
├── preview/             # Email Preview (Mail icon)
│   └── page.tsx         # Preview and test emails
└── page.tsx             # Main Email Dashboard (LayoutDashboard icon)
```

## 🎯 Main Sections

### 1. Email Dashboard (`/dashboard/email`)
- **Icon**: LayoutDashboard
- **Purpose**: Main overview of email activities
- **Features**:
  - Quick stats and metrics
  - Recent email activity
  - System status
  - Quick actions to other email features

### 2. Email Preview (`/dashboard/email/preview`)
- **Icon**: Mail
- **Purpose**: Test and preview email templates
- **Features**:
  - Real-time email preview
  - Device compatibility testing
  - Template rendering
  - Responsive design checker

### 3. Email Management (`/dashboard/email/dashboard`)
- **Icon**: FileText
- **Purpose**: Manage all email communications
- **Features**:
  - Email list with filtering
  - Email search functionality
  - Batch operations
  - Email status tracking

## 📚 API Reference

### Email Forwarding
- `GET /api/email/forwarding` - Get user's forwarding email
- `POST /api/email/forwarding` - Create/update forwarding email
- `DELETE /api/email/forwarding` - Remove forwarding email

### Email Management
- `GET /api/emails` - List emails with filters
- `GET /api/emails/:id` - Get email details
- `POST /api/emails` - Create new email

## 🧪 Testing

Run tests with:
```bash
pnpm test
# or
npm test
# or
yarn test
```

## 🚀 Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js Team
- React Email
- Tailwind CSS

## Features

- **Email Forwarding**
  - Generate unique forwarding addresses
  - Set up forwarding rules
  - Manage destinations

- **Email Testing**
  - Preview emails in real-time
  - Test across multiple devices
  - Check rendering in different email clients

- **Template Management**
  - Create and edit templates
  - Preview before sending
  - Version control

## Built With

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- React Email
- Nodemailer

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the `.env.example` to `.env.local` and update the environment variables
4. Run the development server:
   ```bash
   pnpm dev
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## License

MIT
