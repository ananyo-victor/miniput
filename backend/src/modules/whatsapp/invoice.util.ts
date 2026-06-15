import PDFDocument from 'pdfkit';
import MiniputLogo from "../../assets/MINIPUT_LOGO.png";
import KwinkLogo from "../../assets/kwink_LOGO.png";
export interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}
export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerAddress?: string;
  createdAt: string | Date;
  items: InvoiceItem[];
  taxRate?: number; // e.g., 10 for 10%
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Default font setup
    const fontRegular = 'Helvetica';
    const fontBold = 'Helvetica-Bold';
    const primaryColor = '#000000';
    const secondaryColor = '#333333';
    const boxColor = '#F4F5F7';

    // --- HEADER ---
    doc.font(fontBold).fontSize(14).fillColor(primaryColor).text('SANTOSH ARTS', 50, 50);
    doc.fontSize(45).text('INVOICE', 47, 65, { characterSpacing: 2 });
    
    doc.fontSize(10).font(fontBold).text('Invoice ID: ', 50, 115, { continued: true })
       .font(fontRegular).text(data.orderId);

    // Logos (Positioned on the top right)
    // Note: ensure the path/bundler resolves these properly in your Node environment.
    try {
      doc.image(MiniputLogo, 420, 30, { width: 80 });
      doc.image(KwinkLogo, 420, 65, { width: 80 });
    } catch (error) {
      // Fallback if images are not found during generation
      doc.fontSize(10).text('Miniput Logo', 420, 40);
      doc.text('Kwink Logo', 420, 70);
    }

    doc.font(fontBold).text('Date: ', 420, 115, { continued: true })
       .font(fontRegular).text(new Date(data.createdAt).toLocaleDateString('en-GB'));

    // --- BILLED TO / PAYMENT METHOD BOX ---
    const topBoxY = 145;
    doc.roundedRect(50, topBoxY, 495, 65, 8).fill(boxColor);
    
    doc.fillColor(primaryColor);
    
    // Left side
    doc.font(fontBold).fontSize(10).text('Billed To', 70, topBoxY + 15);
    doc.font(fontRegular)
       .text(`Name:       ${data.customerName || 'N/A'}`, 70, topBoxY + 30)
       .text(`Address:    ${data.customerAddress || 'N/A'}`, 70, topBoxY + 45);

    // Right side
    doc.font(fontBold).text('Payment Method', 380, topBoxY + 15);
    doc.font(fontRegular)
       .text('Bank Number:', 380, topBoxY + 30)
       .text('0123 4567 8901 2345', 380, topBoxY + 45);

    // --- MAIN TABLE BOX ---
    const tableTop = 230;
    const itemSpacing = 25;
    const itemsHeight = data.items.length * itemSpacing;
    const tableBoxHeight = 100 + itemsHeight + 110; // Header + Items + Totals padding
    
    doc.roundedRect(50, tableTop, 495, tableBoxHeight, 10).fill(boxColor);
    doc.fillColor(primaryColor);

    // Table Headers
    const colNo = 70;
    const colName = 120;
    const colQty = 290;
    const colPrice = 360;
    const colTotal = 460;
    
    const headerY = tableTop + 20;
    doc.font(fontBold);
    doc.text('No', colNo, headerY);
    doc.text('Item Name', colName, headerY);
    doc.text('Qty', colQty, headerY);
    doc.text('Unit Price', colPrice, headerY);
    doc.text('Total', colTotal, headerY);

    // Divider Line
    doc.moveTo(70, headerY + 15).lineTo(525, headerY + 15).lineWidth(0.5).strokeColor('#D3D3D3').stroke();

    // Table Items
    doc.font(fontRegular);
    let currentY = headerY + 35;
    let subTotal = 0;

    data.items.forEach((item, index) => {
      const total = item.qty * item.price;
      subTotal += total;

      doc.text((index + 1).toString(), colNo, currentY);
      doc.text(item.name, colName, currentY, { width: 160 });
      doc.text(item.qty.toString(), colQty, currentY);
      doc.text(`$${item.price.toFixed(0)}`, colPrice, currentY);
      doc.text(`$${total.toFixed(0)}`, colTotal, currentY);

      currentY += itemSpacing;
    });

    // Divider Line below items
    doc.moveTo(70, currentY).lineTo(525, currentY).lineWidth(1).strokeColor('#000000').stroke();

    currentY += 20;

    // --- TERMS AND TOTALS ---
    // Terms (Left)
    doc.font(fontBold).text('Terms and Condition', colNo, currentY);
    doc.font(fontRegular).fontSize(9).fillColor(secondaryColor)
       .text('All invoices must be paid within 30 days\nfrom the date of the invoice unless\notherwise agreed upon in writing. Late\npayments may incur additional charges.', colNo, currentY + 15, { width: 220, lineGap: 2 });

    // Totals (Right)
    const taxRate = data.taxRate || 10;
    const taxAmount = subTotal * (taxRate / 100);
    const grandTotal = subTotal + taxAmount;

    doc.fontSize(10).fillColor(primaryColor);
    doc.font(fontBold).text('Sub Total', 350, currentY);
    doc.font(fontRegular).text(`$${subTotal.toFixed(0)}`, colTotal, currentY);

    doc.font(fontRegular).text(`Tax (${taxRate}%)`, 350, currentY + 20);
    doc.text(`$${taxAmount.toFixed(0)}`, colTotal, currentY + 20);

    doc.font(fontBold).text('Total', 350, currentY + 45);
    doc.text(`$${grandTotal.toFixed(0)}`, colTotal, currentY + 45);

    // --- FOOTER ---
    const footerY = tableTop + tableBoxHeight + 40;

    // Contact Us (Left)
    doc.font(fontBold).fontSize(11).text('Contact Us:', 50, footerY);
    doc.font(fontRegular).fontSize(9).fillColor(secondaryColor)
       .text('+123-456-7890', 50, footerY + 15)
       .text('hello@reallygreatsite.com', 50, footerY + 30)
       .text('123 Anywhere St., Any City', 50, footerY + 45);

    // Payment Details (Left, below contact)
    const paymentY = footerY + 70;
    doc.font(fontBold).fontSize(11).fillColor(primaryColor).text('Payment details', 50, paymentY);
    doc.font(fontRegular).fontSize(9).fillColor(secondaryColor)
       .text('account name\naccount no.\nifsc code\nupi id\nphone no.\nscanner', 50, paymentY + 15, { lineGap: 2 });

    // Signature (Right)
    // Note: If you have an actual signature image, use doc.image(). Here we draw a placeholder line.
    const sigX = 380;
    const sigY = footerY + 80;
    
    // Draw a mock scribble/signature
    doc.moveTo(sigX + 20, sigY + 10)
       .bezierCurveTo(sigX + 40, sigY - 20, sigX + 60, sigY + 40, sigX + 80, sigY)
       .bezierCurveTo(sigX + 90, sigY - 10, sigX + 100, sigY + 10, sigX + 120, sigY - 5)
       .lineWidth(1).strokeColor('#000000').stroke();

    // Signature Line
    doc.moveTo(sigX, sigY + 25).lineTo(sigX + 150, sigY + 25).lineWidth(1).strokeColor('#000000').stroke();
    doc.font(fontRegular).fontSize(10).fillColor(primaryColor)
       .text('Rosa Maria Aguado', sigX, sigY + 35, { width: 150, align: 'center' });

    doc.end();
  });
}