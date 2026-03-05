const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOrderConfirmation = async (toEmail, userName, order) => {
    const itemsHtml = order.items.map(item =>
        `<tr>
            <td style="padding:8px;border-bottom:1px solid #333;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #333;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #333;text-align:right;">₹${item.price * item.quantity}</td>
        </tr>`
    ).join('');

    const mailOptions = {
        from: `"Guna's Lathe Works" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Order Confirmed - ${order.invoiceNumber} | Guna's Lathe Works`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#e0e0e0;border-radius:8px;overflow:hidden;">
            <div style="background:#ffa500;padding:20px;text-align:center;">
                <h1 style="margin:0;color:#000;font-size:24px;">Order Confirmed! ✅</h1>
                <p style="margin:5px 0;color:#000;">Guna's Lathe Works & Machining</p>
            </div>
            <div style="padding:30px;">
                <p>Dear <strong>${userName}</strong>,</p>
                <p>Thank you for your order! We have received your order and will process it shortly.</p>
                <div style="background:#2a2a2a;border-radius:8px;padding:15px;margin:20px 0;">
                    <p><strong>Invoice:</strong> ${order.invoiceNumber}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <p><strong>Status:</strong> <span style="color:#ffa500;">${order.orderStatus}</span></p>
                </div>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <thead>
                        <tr style="background:#ffa500;color:#000;">
                            <th style="padding:10px;text-align:left;">Item</th>
                            <th style="padding:10px;text-align:center;">Qty</th>
                            <th style="padding:10px;text-align:right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div style="text-align:right;padding:10px 0;border-top:2px solid #ffa500;">
                    <p>Subtotal: ₹${order.subtotal}</p>
                    <p>GST (18%): ₹${order.gst}</p>
                    <p>Shipping: ${order.shippingCost === 0 ? 'Free' : '₹' + order.shippingCost}</p>
                    <p style="font-size:18px;font-weight:bold;color:#ffa500;">Grand Total: ₹${order.totalAmount}</p>
                </div>
                <div style="background:#2a2a2a;border-radius:8px;padding:15px;margin:20px 0;">
                    <strong>Shipping To:</strong><br>
                    ${order.shippingAddress.fullName}<br>
                    ${order.shippingAddress.addressLine}, ${order.shippingAddress.city}<br>
                    ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
                </div>
                <p>For any queries, contact us at <a href="mailto:gunasekar88@gmail.com" style="color:#ffa500;">gunasekar88@gmail.com</a> or call +91 8870725025.</p>
            </div>
            <div style="background:#111;padding:15px;text-align:center;font-size:12px;color:#888;">
                <p>© 2026 Guna's Lathe Works & Machining, Thingalur, Erode, Tamil Nadu</p>
            </div>
        </div>`
    };

    await transporter.sendMail(mailOptions);
};

const sendContactEmail = async ({ name, email, phone, subject, message }) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `Contact Form: ${subject}`,
        html: `<h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p><p>${message}</p>`
    });
};

module.exports = { sendOrderConfirmation, sendContactEmail };
