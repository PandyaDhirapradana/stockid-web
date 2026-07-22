const sendPasswordResetEmail = async (email, name, resetToken, customUrl = null) => {
  const resetUrl = customUrl || `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Stock.ID VIP', email: 'stock.id.vip@gmail.com' },
        to: [{ email: email, name: name }],
        subject: 'Stock.ID — Reset Password',
        htmlContent: `
          <body style="background:#121212;color:#fff;font-family:sans-serif;padding:20px 10px;margin:0;">
            <div style="max-width:500px;width:100%;margin:0 auto;background:#1e1e1e;border-radius:12px;padding:24px 20px;border:1px solid #3f3f46;box-sizing:border-box;">
              <div style="text-align:center;margin-bottom:24px;">
                <h2 style="color:#fff;font-size:24px;margin:0;">Stock<span style="color:#22c55e;">.ID</span></h2>
              </div>
              <h3 style="color:#22c55e;">Reset Password</h3>
              <p style="font-size:14px;line-height:1.5;">Halo <strong>${name}</strong>,</p>
              <p style="font-size:14px;line-height:1.5;">Klik tombol di bawah untuk reset password (berlaku 15 menit):</p>
              <div style="text-align:center;">
                <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#22c55e;color:#000;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
                  Reset Password
                </a>
              </div>
              <p style="color:#71717a;font-size:12px;">Abaikan jika tidak meminta reset password.</p>
              <p style="color:#71717a;font-size:12px;margin-top:16px;">© ${new Date().getFullYear()} Stock.ID VIP</p>
            </div>
          </body>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengirim email');
    }

    console.log('✅ Email reset password terkirim via Brevo API:', data.messageId);
  } catch (error) {
    console.error('❌ Error Brevo API (Password Reset):', error.message || error);
  }
};

const sendPaymentReceiptEmail = async (email, name, orderId, classCategory, amount, status) => {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);

  const statusText = status === 'pending' ? 'Menunggu Konfirmasi Admin'
    : status === 'approved' ? 'Disetujui'
    : 'Ditolak';
  const statusColor = status === 'pending' ? '#f59e0b'
    : status === 'approved' ? '#22c55e'
    : '#ef4444';

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Stock.ID VIP', email: 'stock.id.vip@gmail.com' },
        to: [{ email: email, name: name }],
        subject: `Stock.ID — Bukti Transaksi #${orderId}`,
        htmlContent: `
          <body style="background:#121212;color:#fff;font-family:sans-serif;padding:20px 10px;margin:0;">
            <div style="max-width:500px;width:100%;margin:0 auto;background:#1e1e1e;border-radius:12px;padding:24px 20px;border:1px solid #3f3f46;box-sizing:border-box;">
              <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#fff;font-size:24px;margin:0;">Stock<span style="color:#22c55e;">.ID</span></h2>
                <p style="color:#71717a;font-size:13px;margin-top:4px;">Bukti Transaksi</p>
              </div>
              <p style="font-size:14px;line-height:1.5;margin-bottom:8px;">Halo <strong>${name}</strong>,</p>
              <p style="font-size:14px;line-height:1.5;margin-top:0;">Terima kasih telah melakukan pembayaran. Berikut detail transaksi kamu:</p>
              
              <div style="background:#2a2a2a;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #3f3f46;box-sizing:border-box;">
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                  <tr>
                    <td style="color:#71717a;padding:8px 0;border-bottom:1px solid #3f3f46;width:35%;vertical-align:top;">Order ID</td>
                    <td style="text-align:right;padding:8px 0;border-bottom:1px solid #3f3f46;font-family:monospace;font-size:11px;word-break:break-all;word-wrap:break-word;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="color:#71717a;padding:8px 0;border-bottom:1px solid #3f3f46;vertical-align:top;">Nama</td>
                    <td style="text-align:right;padding:8px 0;border-bottom:1px solid #3f3f46;word-break:break-word;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color:#71717a;padding:8px 0;border-bottom:1px solid #3f3f46;vertical-align:top;">Paket</td>
                    <td style="text-align:right;padding:8px 0;border-bottom:1px solid #3f3f46;word-break:break-word;">${classCategory}</td>
                  </tr>
                  <tr>
                    <td style="color:#71717a;padding:8px 0;border-bottom:1px solid #3f3f46;vertical-align:top;">Jumlah</td>
                    <td style="text-align:right;padding:8px 0;border-bottom:1px solid #3f3f46;color:#22c55e;font-weight:bold;">${formattedAmount}</td>
                  </tr>
                  <tr>
                    <td style="color:#71717a;padding:8px 0;vertical-align:top;">Status</td>
                    <td style="text-align:right;padding:8px 0;color:${statusColor};font-weight:bold;word-break:break-word;">${statusText}</td>
                  </tr>
                </table>
              </div>

              <p style="color:#71717a;font-size:12px;line-height:1.4;">Admin akan mengkonfirmasi pembayaran dalam 1x24 jam.</p>
              <p style="color:#71717a;font-size:12px;margin-top:20px;">© ${new Date().getFullYear()} Stock.ID VIP. Semua hak dilindungi.</p>
            </div>
          </body>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengirim email');
    }

    console.log('✅ Email bukti transaksi terkirim via Brevo API:', data.messageId);
  } catch (error) {
    console.error('❌ Error Brevo API (Payment Receipt):', error.message || error);
  }
};

module.exports = { sendPasswordResetEmail, sendPaymentReceiptEmail };