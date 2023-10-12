import AWS from 'aws-sdk';
import type { Admin } from '../interfaces/admin.interface';
import type { Role } from '../interfaces/invite.interface';

/**
 * Sends an email to the specified email address with a link to accept the invitation.
 *
 * @param sender The admin who is sending the invitation.
 * @param role The role the invitee will have.
 * @param email The email address of the invitee.
 */
export const sendInviteEmail = (
  role: Role,
  email: string,
  sender: Admin | null
) => {
  console.log('called sendInviteEmail');

  // auth config
  const ses = new AWS.SES({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.REGION,
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
  ses.updateTemplate(emailTemplate, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });

  const params = {
    Template: 'BIOInvitation',
    Destination: {
      ToAddresses: [email],
    },
    Source: 'cwrubookiown@gmail.com',
    TemplateData: JSON.stringify(data),
  };

  // send email
  ses.sendTemplatedEmail(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });

  // const template =
  //   'Hello!\n{{senderMessage}} to join the Book I Own club as a {{newRole}}.' +
  //   'to accept the invitation, click the link below:\n{{link}}';

  // const baseURL = 'https://book-i-own/invite/accept/';
  // const data = {
  //   senderMessage: sender
  //     ? `${sender.firstName} has invited you`
  //     : 'You have been invited',
  //   newRole: role,
  //   link: baseURL + generateInviteCode(),
  // };

  // const ses = new SES({ region: 'us-east-1' });
  // const params = {
  //   Source: 'noreply-cwrubio@gmail.com',
  //   Template: template,
  //   TemplateData: JSON.stringify(data),
  //   Destination: {
  //     ToAddresses: [email],
  //   },
  //   Message: {
  //     Subject: {
  //       Charset: 'UTF-8',
  //       Data: 'Book I Own Invitation',
  //     },
  //   },
  // };

  // ses.sendTemplatedEmail(params, (error, data) => {
  //   if (error) {
  //     console.log(error);
  //     return error;
  //   } else {
  //     console.log(data);
  //     return null;
  //   }
  // });
};

export const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
