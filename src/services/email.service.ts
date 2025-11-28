/**
 * @fileoverview Email Notification Service
 * Send transactional emails using Resend or SendGrid
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailOptions {
  template: 'welcome' | 'application_received' | 'application_status' | 'new_message' | 'payment_received' | 'payment_released' | 'assignment_match' | 'verification_status';
  to: string;
  data: Record<string, string | number | boolean>;
}

const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'noreply@trustwork.com';
const API_KEY = import.meta.env.VITE_EMAIL_API_KEY || '';

/**
 * Send email using Resend API
 */
async function sendWithResend(email: EmailTemplate): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: email.from || FROM_EMAIL,
      to: [email.to],
      subject: email.subject,
      html: email.html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Generate email HTML templates
 */
function generateEmailHTML(template: EmailOptions['template'], data: Record<string, string | number | boolean>): string {
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #10b981; color: white; padding: 20px; text-align: center; }
      .content { padding: 30px; background: #f9fafb; }
      .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
  `;

  switch (template) {
    case 'welcome':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Welcome to TrustWork!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Thank you for joining TrustWork - the safety-focused job marketplace where trust comes first.</p>
            <p>To get started:</p>
            <ul>
              <li>Complete your profile</li>
              <li>${data.role === 'employer' ? 'Post your first job' : 'Browse available jobs'}</li>
              <li>${data.role === 'employer' ? 'Verify your business' : 'Complete skill assessments'}</li>
            </ul>
            <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>© 2025 TrustWork. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'application_received':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>New Application Received</h1>
          </div>
          <div class="content">
            <p>Hi ${data.employerName},</p>
            <p><strong>${data.applicantName}</strong> has applied for your job posting: <strong>${data.jobTitle}</strong></p>
            <p><strong>Proposed Budget:</strong> $${data.bidAmount}</p>
            <p><strong>Estimated Duration:</strong> ${data.estimatedDuration}</p>
            <a href="${data.applicationUrl}" class="button">View Application</a>
          </div>
          <div class="footer">
            <p>© 2025 TrustWork. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'application_status':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <p>Hi ${data.applicantName},</p>
            <p>Your application for <strong>${data.jobTitle}</strong> has been <strong>${data.status}</strong>.</p>
            ${data.status === 'accepted' ? `
              <p>Congratulations! The employer wants to work with you.</p>
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Review the project details</li>
                <li>Start communication with the employer</li>
                <li>Begin work once payment is secured</li>
              </ul>
            ` : ''}
            ${data.message ? `<p><strong>Message from employer:</strong> ${data.message}</p>` : ''}
            <a href="${data.assignmentUrl}" class="button">View Details</a>
          </div>
          <div class="footer">
            <p>© 2025 TrustWork. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'new_message':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>New Message</h1>
          </div>
          <div class="content">
            <p>Hi ${data.recipientName},</p>
            <p><strong>${data.senderName}</strong> sent you a message:</p>
            <blockquote style="border-left: 3px solid #10b981; padding-left: 15px; margin: 20px 0;">
              ${data.messagePreview}
            </blockquote>
            <a href="${data.conversationUrl}" class="button">View Conversation</a>
          </div>
          <div class="footer">
            <p>© 2025 TrustWork. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'payment_received':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Payment Received</h1>
          </div>
          <div class="content">
            <p>Hi ${data.recipientName},</p>
            <p>Payment of <strong>$${data.amount}</strong> has been received and held in escrow for:</p>
            <p><strong>${data.assignmentTitle}</strong></p>
            <p>The funds will be released upon successful completion of the work.</p>
            <a href="${data.assignmentUrl}" class="button">View Project</a>
          </div>
          <div class="footer">
            <p>© 2025 TrustWork. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'payment_released':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Payment Released</h1>
          </div>
          <div class="content">
            <p>Hi ${data.recipientName},</p>
            <p>Great news! Payment of <strong>$${data.amount}</strong> has been released for:</p>
            <p><strong>${data.assignmentTitle}</strong></p>
            <p>The funds will be transferred to your account within 2-3 business days.</p>
            <a href="${data.transactionUrl}" class="button">View Transaction</a>
          </div>
          <div class="footer">
            <p>© 2025 TrustWork. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'assignment_match':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>New Job Match!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>We found a job that matches your skills and preferences:</p>
            <h2>${data.jobTitle}</h2>
            <p><strong>Budget:</strong> $${data.budgetMin} - $${data.budgetMax}</p>
            <p><strong>Location:</strong> ${data.location || 'Remote'}</p>
            <p><strong>Match Score:</strong> ${data.matchScore}%</p>
            <p>${data.description.substring(0, 200)}...</p>
            <a href="${data.jobUrl}" class="button">View Job</a>
          </div>
          <div class="footer">
            <p>© 2025 TrustWork. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'verification_status':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Business Verification Update</h1>
          </div>
          <div class="content">
            <p>Hi ${data.businessName},</p>
            <p>Your business verification status has been updated to: <strong>${data.status}</strong></p>
            ${data.status === 'verified' ? `
              <p>Congratulations! Your business is now verified on TrustWork.</p>
              <p>You now have access to:</p>
              <ul>
                <li>Verified badge on your profile</li>
                <li>Priority job listings</li>
                <li>Enhanced trust from job seekers</li>
              </ul>
            ` : ''}
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
            <a href="${data.profileUrl}" class="button">View Profile</a>
          </div>
          <div class="footer">
            <p>© 2025 TrustWork. All rights reserved.</p>
          </div>
        </div>
      `;

    default:
      return '';
  }
}

/**
 * Send templated email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const html = generateEmailHTML(options.template, options.data);
  
  const subjectMap: Record<EmailOptions['template'], string> = {
    welcome: 'Welcome to TrustWork!',
    application_received: 'New Application Received',
    application_status: 'Application Status Update',
    new_message: 'New Message on TrustWork',
    payment_received: 'Payment Received and Held in Escrow',
    payment_released: 'Payment Released',
    assignment_match: 'New Job Match Found!',
    verification_status: 'Business Verification Update',
  };

  await sendWithResend({
    to: options.to,
    subject: subjectMap[options.template],
    html,
  });
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string, role: 'job_seeker' | 'employer', dashboardUrl: string): Promise<void> {
  await sendEmail({
    template: 'welcome',
    to: userEmail,
    data: { name: userName, role, dashboardUrl },
  });
}

/**
 * Send application received email to employer
 */
export async function sendApplicationReceivedEmail(
  employerEmail: string,
  employerName: string,
  applicantName: string,
  jobTitle: string,
  bidAmount: number,
  estimatedDuration: string,
  applicationUrl: string
): Promise<void> {
  await sendEmail({
    template: 'application_received',
    to: employerEmail,
    data: { employerName, applicantName, jobTitle, bidAmount, estimatedDuration, applicationUrl },
  });
}

/**
 * Send application status update to applicant
 */
export async function sendApplicationStatusEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  status: string,
  assignmentUrl: string,
  message?: string
): Promise<void> {
  await sendEmail({
    template: 'application_status',
    to: applicantEmail,
    data: { applicantName, jobTitle, status, assignmentUrl, message },
  });
}

/**
 * Send new message notification
 */
export async function sendNewMessageEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  conversationUrl: string
): Promise<void> {
  await sendEmail({
    template: 'new_message',
    to: recipientEmail,
    data: { recipientName, senderName, messagePreview, conversationUrl },
  });
}

/**
 * Send payment received (escrow) notification to freelancer
 */
export async function sendPaymentReceivedEmail(
  freelancerEmail: string,
  freelancerName: string,
  clientName: string,
  amount: number,
  gigTitle: string,
  milestoneName: string,
  earningsUrl: string
): Promise<void> {
  await sendEmail({
    template: 'payment_received',
    to: freelancerEmail,
    data: { freelancerName, clientName, amount, gigTitle, milestoneName, earningsUrl },
  });
}

/**
 * Send payment released notification to freelancer
 */
export async function sendPaymentReleasedEmail(
  freelancerEmail: string,
  freelancerName: string,
  amount: number,
  gigTitle: string,
  payoutUrl: string
): Promise<void> {
  await sendEmail({
    template: 'payment_released',
    to: freelancerEmail,
    data: { freelancerName, amount, gigTitle, payoutUrl },
  });
}

/**
 * Send job match notification
 */
export async function sendAssignmentMatchEmail(
  userEmail: string,
  userName: string,
  jobTitle: string,
  budgetMin: number,
  budgetMax: number,
  location: string,
  description: string,
  matchScore: number,
  jobUrl: string
): Promise<void> {
  await sendEmail({
    template: 'assignment_match',
    to: userEmail,
    data: { name: userName, jobTitle, budgetMin, budgetMax, location, description, matchScore, jobUrl },
  });
}

/**
 * Send business verification status notification
 */
export async function sendVerificationStatusEmail(
  businessEmail: string,
  businessName: string,
  status: 'verified' | 'rejected' | 'pending',
  profileUrl: string,
  message?: string
): Promise<void> {
  await sendEmail({
    template: 'verification_status',
    to: businessEmail,
    data: { businessName, status, profileUrl, message: message || '' },
  });
}
