import {
  SESClient,
  SendTemplatedEmailCommand,
  UpdateTemplateCommand,
} from '@aws-sdk/client-ses';
import { fromEnv } from '@aws-sdk/credential-providers';
import type { Admin } from '../interfaces/admin.interface';
import type { Role } from '../interfaces/invite.interface';

/**
 * Sends an email to the specified email address with a link to accept the invitation.
 *
 * @param sender The admin who is sending the invitation.
 * @param role The role the invitee will have.
 * @param email The email address of the invitee.
 */
export const sendInviteEmail = async (
  role: Role,
  email: string,
  sender: Admin | null
) => {
  console.log('called sendInviteEmail');

  // auth config
  // const ses = new AWS.SES({
  //   accessKeyId: process.env.accessKeyId,
  //   secretAccessKey: process.env.secretAccessKey,
  //   region: process.env.REGION,
  // });
  // auth config
  const ses = new SESClient({
    region: process.env.REGION,
    credentials: fromEnv(),
  });

  // Base URL for email link
  const baseURL = 'https://book-i-own/invite/accept/';

  // const senderAdmin = await Admin.findById(senderId);

  // Template data from request body
  const data = {
    senderName: sender?.firstName || 'Albert',
    newRole: role,
    link: baseURL,
  };

  // Email Template
  const emailTemplate = {
    Template: {
      TemplateName: 'BIOInvitation',
      SubjectPart: 'Book I Own Invitation',
      HtmlPart:
        '<h1>Hello!</h1><p>You have been invited to join Book I Own as a {{newRole}} by {{senderName}}. Please click the link below to accept the invitation.</p><p><a href="{{link}}">Accept Invitation</a></p>',
      TextPart:
        'Hello!\nYou have been invited to join Book I Own as a {{newRole}} by {{senderName}}. Please click the link below to accept the invitation.\n{{link}}',
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
