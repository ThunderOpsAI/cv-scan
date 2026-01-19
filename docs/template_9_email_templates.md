# Template 9: Email Templates

## Email Service Setup (lib/email/index.ts)
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  const { data, error } = await resend.emails.send({
    from: 'YourApp <noreply@yourapp.com>',
    to,
    subject,
    react,
  })

  if (error) {
    console.error('Email error:', error)
    throw error
  }

  return data
}
```

## Welcome Email (emails/welcome.tsx)
```typescript
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components'

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to YourApp!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome aboard, {name}! 🎉</Heading>
          <Text style={text}>
            We're thrilled to have you. Here's what you can do to get started:
          </Text>
          <ul>
            <li>Complete your profile</li>
            <li>Explore our features</li>
            <li>Join our community</li>
          </ul>
          <Link href="https://yourapp.com/dashboard" style={button}>
            Go to Dashboard
          </Link>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', margin: '40px 0 20px' }
const text = { fontSize: '16px', lineHeight: '24px', margin: '16px 0' }
const button = {
  backgroundColor: '#000',
  color: '#fff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}
```

## Payment Receipt (emails/payment-receipt.tsx)
```typescript
export function PaymentReceiptEmail({
  name,
  amount,
  date,
  plan,
}: {
  name: string
  amount: number
  date: string
  plan: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Payment Receipt</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Received</Heading>
          <Text>Hi {name},</Text>
          <Text>Thank you for your payment!</Text>
          <div style={{ backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
            <Text><strong>Amount:</strong> ${amount.toFixed(2)}</Text>
            <Text><strong>Plan:</strong> {plan}</Text>
            <Text><strong>Date:</strong> {date}</Text>
          </div>
        </Container>
      </Body>
    </Html>
  )
}
```

## Usage
```typescript
import { WelcomeEmail } from '@/emails/welcome'
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: user.email,
  subject: 'Welcome to YourApp!',
  react: <WelcomeEmail name={user.name} />,
})
```
