import logger from '../config/logger';

export class NotificationService {
  /**
   * Simulated SMS gateway dispatch (integrates with providers like Beem, Selcom, or Twilio)
   */
  public static async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    logger.info(`[SMS Gateway] Dispatched to ${phoneNumber}: "${message}"`);
    return true;
  }

  /**
   * Simulated Email gateway dispatch (Nodemailer, SendGrid, or AWS SES)
   */
  public static async sendEmail(email: string, subject: string, htmlContent: string): Promise<boolean> {
    logger.info(`[Email Gateway] Dispatched to ${email} (Subject: ${subject})`);
    return true;
  }

  /**
   * Trigger SMS OTP notification
   */
  public static async sendOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
    const message = `Fundi Service Tanzania: Namba yako ya uhakiki ni ${otpCode}. Namba hii itaisha baada ya dakika 5. Usimpe mtu yeyote!`;
    return NotificationService.sendSMS(phoneNumber, message);
  }

  /**
   * Trigger Login notification alert
   */
  public static async sendLoginAlert(email: string, device: string, ip: string): Promise<boolean> {
    const subject = 'Fundi Service Tanzania: New Login Detected';
    const html = `<p>Habari,</p><p>A mpya ya kuingia (new login) imegunduliwa kwenye akunti yako ya Fundi Service kutoka kwenye kifaa: <b>${device}</b> (IP: ${ip}). Ikiwa si wewe, tafadhali badilisha nenosiri lako haraka.</p>`;
    return NotificationService.sendEmail(email, subject, html);
  }
}
