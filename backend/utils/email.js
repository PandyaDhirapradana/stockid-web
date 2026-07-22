const nodemailer = require('nodemailer');

// Buat transporter Nodemailer menggunakan SMTP Resend
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true, // Pakai SSL
  auth: {
    user: 'resend', // Tulisan 'resend' (jangan diganti)
    pass: process.env.RESEND_API_KEY, // API Key Resend dari dashboard
  },
});

const sendPasswordResetEmail = async (email, name, resetToken, customUrl = null) => {
  const resetUrl = customUrl || `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    const info = await transporter.sendMail({
      from: 'Stock.ID <onboarding@resend.dev>',
      to: email,
      subject: 'Stock.ID — Reset Password',
      html: `
        <body style="background:#121212;color:#fff;font-family:sans-serif;padding:40px;">
          <div style="max-width:500px;margin:0 auto;background:#1e1e1e;border-radius:12px;padding:32px;border:1px solid #3f3f46;">
            <div style="text-align:center;margin-bottom:24px;">
              <h2 style="color:#22c55e;font-size:24px;margin:0;">Stock<span style="color:#fff;">.ID</span></h2>
            </div>
            <h3 style="color:#22c55e;">Reset Password</h3>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Klik tombol di bawah untuk reset password (berlaku 15 menit):</p>
            <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#22c55e;color:#000;border-radius:8px;text-decoration:none;font-weight:bold;">
              Reset Password
            </a>
            <p style="color:#71717a;font-size:12px;">Abaikan jika tidak meminta reset password.</p>
            <p style="color:#71717a;font-size:12px;margin-top:16px;">© ${new Date().getFullYear()} Stock.ID VIP</p>
          </div>
        </body>
      `,
    });
    console.log('Email reset password terkirim via SMTP:', info.messageId);
  } catch (error) {
    console.error('Gagal kirim email reset password:', error);
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
    const info = await transporter.sendMail({
      from: 'Stock.ID <onboarding@resend.dev>',
      to: email,
      subject: `Stock.ID — Bukti Transaksi #${orderId}`,
      html: `
        <body style="background:#121212;color:#fff;font-family:sans-serif;padding:40px;">
          <div style="max-width:500px;margin:0 auto;background:#1e1e1e;border-radius:12px;padding:32px;border:1px solid #3f3f46;">
            <div style="text-align:center;margin-bottom:24px;">
              <h2 style="color:#22c55e;font-size:24px;margin:0;">Stock<span style="color:#fff;">.ID</span></h2>
              <p style="color:#71717a;font-size:13px;margin-top:4px;">Bukti Transaksi</p>
            </div>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Terima kasih telah melakukan pembayaran. Berikut detail transaksi kamu:</p>
            <div style="background:#2a2a2a;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #3f3f46;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#71717a;padding:8px 0;border-bottom:1px solid #3f3f46;">Order ID</td><td style="text-align:right;font-family:monospace;font-size:12px;">${orderId}</td></tr>
                <tr><td style="color:#71717a;padding:8px 0;border-bottom:1px solid #3f3f46;">Nama</td><td style="text-align:right;">${name}</td></tr>
                <tr><td style="color:#71717a;padding:8px 0;border-bottom:1px solid #3f3f46;">Paket</td><td style="text-align:right;">${classCategory}</td></tr>
                <tr><td style="color:#71717a;padding:8px 0;border-bottom:1px solid #3f3f46;">Jumlah</td><td style="text-align:right;color:#22c55e;font-weight:bold;">${formattedAmount}</td></tr>
                <tr><td style="color:#71717a;padding:8px 0;">Status</td><td style="text-align:right;color:${statusColor};font-weight:bold;">${statusText}</td></tr>
              </table>
            </div>
            <p style="color:#71717a;font-size:13px;">Admin akan mengkonfirmasi pembayaran dalam 1x24 jam.</p>
            <p style="color:#71717a;font-size:12px;margin-top:24px;">© ${new Date().getFullYear()} Stock.ID VIP. Semua hak dilindungi.</p>
          </div>
        </body>
      `,
    });
    console.log('Email bukti pembayaran terkirim via SMTP:', info.messageId);
  } catch (error) {
    console.error('Gagal kirim email bukti pembayaran:', error);
  }
};

module.exports = { sendPasswordResetEmail, sendPaymentReceiptEmail };