// Email Generator - Generates thank you and follow-up emails
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmailType, Application, ApplicationStage, StructuredNotes } from '@/types/applications';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface EmailContext {
  application: Application;
  stage?: ApplicationStage;
  recipientName?: string;
  additionalContext?: string;
}

export async function generateEmail(
  emailType: EmailType,
  context: EmailContext
): Promise<{ subject: string; content: string }> {
  const { application, stage, recipientName, additionalContext } = context;
  
  let prompt = '';
  
  switch (emailType) {
    case 'thank_you':
      prompt = buildThankYouPrompt(application, stage, recipientName, additionalContext);
      break;
    case 'follow_up':
      prompt = buildFollowUpPrompt(application, stage, recipientName, additionalContext);
      break;
    case 'withdraw':
      prompt = buildWithdrawPrompt(application, recipientName);
      break;
    case 'accept':
      prompt = buildAcceptPrompt(application, recipientName);
      break;
    case 'decline':
      prompt = buildDeclinePrompt(application, recipientName);
      break;
    case 'negotiate':
      prompt = buildNegotiatePrompt(application, recipientName, additionalContext);
      break;
    default:
      prompt = buildGenericPrompt(application, emailType, additionalContext);
  }

  try {
    const result = await flashModel.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean up response
    if (responseText.startsWith('```json')) {
      responseText = responseText.slice(7);
    } else if (responseText.startsWith('```')) {
      responseText = responseText.slice(3);
    }
    if (responseText.endsWith('```')) {
      responseText = responseText.slice(0, -3);
    }
    responseText = responseText.trim();

    const parsed = JSON.parse(responseText);
    return {
      subject: parsed.subject || `Re: ${application.title} Position`,
      content: parsed.content || 'Thank you for your time.',
    };
  } catch (error) {
    console.error('Email generation error:', error);
    return {
      subject: `Re: ${application.title} Position at ${application.company}`,
      content: `Dear ${recipientName || 'Hiring Manager'},\n\nThank you for your time.\n\nBest regards`,
    };
  }
}

function buildThankYouPrompt(
  application: Application,
  stage?: ApplicationStage,
  recipientName?: string,
  additionalContext?: string
): string {
  const structuredNotes = stage?.ai_structured as StructuredNotes | undefined;
  
  return `Write a personalized thank-you email after an interview.

Context:
- Position: ${application.title} at ${application.company}
- Interviewer: ${recipientName || 'the interviewer'}
- Interview Type: ${stage?.stage_type || 'interview'}
${structuredNotes ? `- Topics Discussed: ${structuredNotes.topics_discussed.join(', ')}` : ''}
${structuredNotes?.their_concerns?.length ? `- Their Concerns: ${structuredNotes.their_concerns.join(', ')}` : ''}
${structuredNotes?.positive_signals?.length ? `- Positive Signals: ${structuredNotes.positive_signals.join(', ')}` : ''}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

Requirements:
1. Reference specific discussion points from the interview
2. Address any concerns they raised (if known)
3. Reinforce enthusiasm for the role
4. Professional but warm tone
5. Under 200 words

Return JSON with:
{
  "subject": "email subject line",
  "content": "full email body"
}`;
}

function buildFollowUpPrompt(
  application: Application,
  stage?: ApplicationStage,
  recipientName?: string,
  additionalContext?: string
): string {
  return `Write a professional follow-up email checking on application status.

Context:
- Position: ${application.title} at ${application.company}
- Recipient: ${recipientName || 'Hiring Manager'}
- Application Status: ${application.status}
- Last Interview: ${stage?.stage_type || 'N/A'}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

Requirements:
1. Polite and professional tone
2. Express continued interest
3. Ask about timeline/next steps
4. Under 150 words
5. Not pushy or demanding

Return JSON with:
{
  "subject": "email subject line",
  "content": "full email body"
}`;
}

function buildWithdrawPrompt(application: Application, recipientName?: string): string {
  return `Write a professional withdrawal email from a job application.

Context:
- Position: ${application.title} at ${application.company}
- Recipient: ${recipientName || 'Hiring Manager'}

Requirements:
1. Thank them for their time and consideration
2. Politely withdraw from consideration
3. Keep the door open for future opportunities
4. Professional and gracious tone
5. Under 100 words

Return JSON with:
{
  "subject": "email subject line",
  "content": "full email body"
}`;
}

function buildAcceptPrompt(application: Application, recipientName?: string): string {
  return `Write a professional job offer acceptance email.

Context:
- Position: ${application.title} at ${application.company}
- Recipient: ${recipientName || 'Hiring Manager'}

Requirements:
1. Express enthusiasm and gratitude
2. Confirm acceptance
3. Ask about next steps (paperwork, start date confirmation)
4. Professional and excited tone
5. Under 150 words

Return JSON with:
{
  "subject": "email subject line",
  "content": "full email body"
}`;
}

function buildDeclinePrompt(application: Application, recipientName?: string): string {
  return `Write a professional job offer decline email.

Context:
- Position: ${application.title} at ${application.company}
- Recipient: ${recipientName || 'Hiring Manager'}

Requirements:
1. Express sincere gratitude for the offer
2. Politely decline
3. Keep the relationship positive
4. Don't over-explain reasons
5. Under 100 words

Return JSON with:
{
  "subject": "email subject line",
  "content": "full email body"
}`;
}

function buildNegotiatePrompt(
  application: Application,
  recipientName?: string,
  additionalContext?: string
): string {
  return `Write a professional salary/offer negotiation email.

Context:
- Position: ${application.title} at ${application.company}
- Recipient: ${recipientName || 'Hiring Manager'}
${additionalContext ? `- Negotiation Points: ${additionalContext}` : ''}

Requirements:
1. Express enthusiasm for the role first
2. Present counter-offer professionally
3. Provide reasoning without being demanding
4. Keep tone collaborative, not adversarial
5. Under 200 words

Return JSON with:
{
  "subject": "email subject line",
  "content": "full email body"
}`;
}

function buildGenericPrompt(
  application: Application,
  emailType: string,
  additionalContext?: string
): string {
  return `Write a professional email related to a job application.

Context:
- Position: ${application.title} at ${application.company}
- Email Type: ${emailType}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

Requirements:
1. Professional tone
2. Clear and concise
3. Under 150 words

Return JSON with:
{
  "subject": "email subject line",
  "content": "full email body"
}`;
}
