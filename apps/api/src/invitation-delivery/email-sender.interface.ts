export interface SendInvitationEmail {
  recipientEmail: string;
  activationUrl: string;
  expiresAt: Date;
}

export interface EmailSender {
  sendInvitation(
    message: SendInvitationEmail,
  ): Promise<void>;
}