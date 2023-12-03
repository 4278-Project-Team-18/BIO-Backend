import {
  SESClient,
  SendTemplatedEmailCommand,
  UpdateTemplateCommand,
} from '@aws-sdk/client-ses';
import { fromEnv } from '@aws-sdk/credential-providers';
import fs from 'fs';
import type { Admin } from '../interfaces/admin.interface';

/**
 * Sends an email to the specified email address with a link to accept the invitation.
 *
 * @param sender The admin who is sending the invitation.
 * @param role The role the invitee will have.
 * @param email The email address of the invitee.
 */
export const sendInviteEmail = async (
  email: string,
  sender: Admin | null,
  inviteID: string
) => {
  console.log('called sendInviteEmail');

  // auth config
  const ses = new SESClient({
    region: process.env.REGION,
    credentials: fromEnv(),
  });

  // Base URL for email link
  const baseURL = 'https://bio-frontend.fly.dev/sign-up/';

  // const senderAdmin = await Admin.findById(senderId);

  // Template data from request body
  const data = {
    senderName: sender?.firstName || 'Albert',
    link: baseURL + inviteID,
  };

  // Read HTML file
  const template = readHTMLFile('src/email-templates/inviteTemplate.html');

  // Email Template
  const emailTemplate = {
    Template: {
      TemplateName: 'BIOInvitation',
      SubjectPart: 'Book I Own Invitation',
      HtmlPart: template,
    },
  };

  // Create Email Template
  await ses.send(new UpdateTemplateCommand(emailTemplate));
  console.log('Email template updated');

  const params = {
    Template: 'BIOInvitation',
    Destination: {
      ToAddresses: [email],
    },
    Source: 'cwrubookiown@gmail.com',
    TemplateData: JSON.stringify(data),
  };

  await ses.send(new SendTemplatedEmailCommand(params));
  console.log('Email sent');
};

function readHTMLFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading HTML file:', error);
    return '';
  }
}
