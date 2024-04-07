export const emailTemplate = (name: string) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f8f8; padding: 20px;">
      <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
      <p style="color: #555; line-height: 1.6;">Thank you for your order!</p>
    </div>
    <div style="padding: 20px;">
      <p style="color: #555; line-height: 1.6;">Your links are attached to this email. Please open them and bookmark them to your favorite browser for easy access later.</p>
    </div>
    <div style="background-color: #f8f8f8; padding: 20px;">
      <p style="color: #555; line-height: 1.6;">If you have any questions or need further assistance, feel free to contact us.</p>
      <br>
      <p style="color: #555; line-height: 1.6;">Thank you for choosing us!</p>
      <p style="color: #555; line-height: 1.6;">Your Bookmarks Team</p>
    </div>
  </div>
  `
}