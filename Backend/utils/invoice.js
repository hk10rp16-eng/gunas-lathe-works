const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order, res) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${order.invoiceNumber}.pdf"`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 100).fill('#1a1a1a');
    doc.fillColor('#ffa500').fontSize(22).font('Helvetica-Bold')
        .text("Guna's Lathe Works & Machining", 50, 25, { align: 'center' });
    doc.fillColor('#cccccc').fontSize(10).font('Helvetica')
        .text('Thingalur, Erode, Tamil Nadu, India', 50, 52, { align: 'center' });
    doc.text('Phone: +91 8870725025 | Email: gunasekar88@gmail.com', 50, 67, { align: 'center' });

    doc.fillColor('#333333').rect(0, 100, doc.page.width, 3).fill('#ffa500');

    // INVOICE title
    doc.fillColor('#222222').rect(50, 120, doc.page.width - 100, 35).fill('#ffa500');
    doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold')
        .text('TAX INVOICE', 50, 130, { align: 'center', width: doc.page.width - 100 });

    // Invoice details
    const infoY = 175;
    doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold').text('Bill To:', 50, infoY);
    doc.font('Helvetica').fillColor('#000000')
        .text(order.shippingAddress?.fullName || 'Customer', 50, infoY + 15)
        .text(`${order.shippingAddress?.addressLine || ''}, ${order.shippingAddress?.city || ''}`, 50, infoY + 30)
        .text(`${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`, 50, infoY + 45)
        .text(`Phone: ${order.shippingAddress?.phone || ''}`, 50, infoY + 60);

    doc.font('Helvetica-Bold').fillColor('#333333')
        .text('Invoice Number:', 350, infoY)
        .text('Date:', 350, infoY + 15)
        .text('Payment Method:', 350, infoY + 30)
        .text('Status:', 350, infoY + 45);
    doc.font('Helvetica').fillColor('#000000')
        .text(order.invoiceNumber, 460, infoY)
        .text(new Date(order.createdAt).toLocaleDateString('en-IN'), 460, infoY + 15)
        .text(order.paymentMethod, 460, infoY + 30)
        .text(order.orderStatus, 460, infoY + 45);

    // Table header
    const tableTop = 280;
    doc.rect(50, tableTop, doc.page.width - 100, 25).fill('#1a1a1a');
    doc.fillColor('#ffa500').fontSize(10).font('Helvetica-Bold')
        .text('#', 55, tableTop + 7)
        .text('Product Name', 80, tableTop + 7)
        .text('Price', 320, tableTop + 7, { width: 80, align: 'right' })
        .text('Qty', 410, tableTop + 7, { width: 50, align: 'center' })
        .text('Total', 470, tableTop + 7, { width: 80, align: 'right' });

    // Table rows
    let y = tableTop + 30;
    doc.fillColor('#000000').font('Helvetica').fontSize(10);
    order.items.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
        doc.rect(50, y - 5, doc.page.width - 100, 22).fill(rowBg);
        doc.fillColor('#333333')
            .text(index + 1, 55, y)
            .text(item.name, 80, y, { width: 230 })
            .text(`₹${item.price}`, 320, y, { width: 80, align: 'right' })
            .text(item.quantity, 410, y, { width: 50, align: 'center' })
            .text(`₹${item.price * item.quantity}`, 470, y, { width: 80, align: 'right' });
        y += 25;
    });

    // Totals
    y += 10;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#ffa500').lineWidth(2).stroke();
    y += 10;
    doc.fillColor('#333333').font('Helvetica').fontSize(11)
        .text('Subtotal:', 370, y, { width: 90, align: 'right' })
        .text(`₹${order.subtotal}`, 470, y, { width: 80, align: 'right' });
    y += 18;
    doc.text('GST (18%):', 370, y, { width: 90, align: 'right' })
        .text(`₹${order.gst}`, 470, y, { width: 80, align: 'right' });
    y += 18;
    doc.text('Shipping:', 370, y, { width: 90, align: 'right' })
        .text(order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`, 470, y, { width: 80, align: 'right' });
    y += 5;
    doc.rect(350, y, doc.page.width - 400, 28).fill('#ffa500');
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(13)
        .text('Grand Total:', 355, y + 7, { width: 100, align: 'right' })
        .text(`₹${order.totalAmount}`, 465, y + 7, { width: 80, align: 'right' });

    // Footer
    y += 60;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#cccccc').lineWidth(1).stroke();
    y += 15;
    doc.fillColor('#888888').font('Helvetica').fontSize(9)
        .text('Thank you for your business! This is a computer-generated invoice.', 50, y, { align: 'center' });
    doc.text('Guna\'s Lathe Works & Machining | Thingalur, Erode, Tamil Nadu | GSTIN: N/A', 50, y + 12, { align: 'center' });

    doc.end();
};

module.exports = { generateInvoicePDF };
