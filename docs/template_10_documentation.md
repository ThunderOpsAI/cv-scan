# Template 10: Documentation Template

## README.md
```markdown
# YourApp - [Tagline]

[Brief description of what your app does and the problem it solves]

## Features

- 🔐 Secure authentication with NextAuth.js
- 💳 Subscription payments via Stripe
- 📧 Automated email notifications
- 📊 Analytics dashboard
- 🎨 Beautiful UI with Tailwind CSS
- ♿ Fully accessible
- 📱 Responsive design

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/yourapp.git
cd yourapp
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. Set up the database
```bash
npm run db:push
npm run db:seed
```

5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `RESEND_API_KEY` - Email service key

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript check
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   └── hooks/            # Custom React hooks
├── prisma/               # Database schema
├── public/               # Static assets
└── tests/                # Test files
```

## Tech Stack

- **Framework:** Next.js 14
- **Database:** PostgreSQL with Prisma
- **Auth:** NextAuth.js
- **Payments:** Stripe
- **Email:** Resend
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT

## Support

- Documentation: [docs.yourapp.com](https://docs.yourapp.com)
- Email: support@yourapp.com
- Discord: [Join our community](https://discord.gg/yourapp)
```

## API Documentation (docs/API.md)
```markdown
# API Documentation

## Authentication

All API requests require authentication via session cookies (NextAuth.js).

## Endpoints

### Users

#### GET /api/users/me
Get current user information

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "subscription": {
    "plan": "PRO",
    "status": "ACTIVE"
  }
}
```

#### PATCH /api/users/me
Update current user

**Request:**
```json
{
  "name": "New Name",
  "bio": "Updated bio"
}
```

### Subscriptions

#### POST /api/subscriptions/checkout
Create checkout session

**Request:**
```json
{
  "priceId": "price_xxx"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

## Rate Limits

- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Admin: 1000 requests/minute

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
```

## User Guide (docs/USER_GUIDE.md)
```markdown
# User Guide

## Getting Started

### Creating an Account
1. Click "Get Started" on the homepage
2. Enter your email and password
3. Verify your email
4. Complete your profile

### Choosing a Plan
1. Navigate to Pricing page
2. Select a plan that fits your needs
3. Enter payment information
4. Start using premium features

### Managing Your Subscription
1. Go to Settings → Billing
2. Click "Manage Subscription"
3. Update payment method or cancel anytime

## Features

### Dashboard
Your dashboard shows an overview of your account activity.

### Settings
Customize your experience in the Settings page.

## FAQ

**Q: How do I cancel my subscription?**
A: Go to Settings → Billing → Manage Subscription

**Q: Can I export my data?**
A: Yes, go to Settings → Data → Export

## Troubleshooting

### I can't log in
- Verify your email address
- Reset your password
- Clear browser cache

### Payment failed
- Check your card details
- Ensure sufficient funds
- Contact support
```
