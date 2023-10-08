import { SES } from 'aws-sdk';
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
  const template =
    'Hello!\n{{senderMessage}} to join the Book I Own club as a {{newRole}}.' +
    'to accept the invitation, click the link below:\n{{link}}';

  const baseURL = 'https://book-i-own/invite/accept/';
  const data = {
    senderMessage: sender
      ? `${sender.firstName} has invited you`
      : 'You have been invited',
    newRole: role,
    link: baseURL + generateInviteCode(),
  };

  const ses = new SES({ region: 'us-east-1' });
  const params = {
    Source: 'noreply-cwrubio@gmail.com',
    Template: template,
    TemplateData: JSON.stringify(data),
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: 'Book I Own Invitation',
      },
    },
  };

  ses.sendTemplatedEmail(params, (error, data) => {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log(data);
      return null;
    }
  });
};

export const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
