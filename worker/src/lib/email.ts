export async function sendEmail(apiKey: string, to: string, subject: string, html: string): Promise<void> {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'EduMatch <noreply@edumatch.app>', to, subject, html }),
  });
}
