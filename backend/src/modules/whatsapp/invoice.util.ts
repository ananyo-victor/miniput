import PDFDocument from 'pdfkit';
import path from 'path';

const MiniputLogo = path.join(__dirname, '../../assets/MINIPUT_LOGO.png');
const KwinkLogo = path.join(__dirname, '../../assets/kwink_LOGO.png');

export interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}
export interface InvoiceData {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt: string | Date;
  items: InvoiceItem[];
  taxRate?: number;
  businessPhone?: string;
  businessAddress?: string;
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
       .font(fontRegular).text(data.orderNumber);

    // Logos (Positioned on the top right)
    // Note: ensure the path/bundler resolves these properly in your Node environment.
    try {
      doc.image(MiniputLogo, 420, 30, { width: 80 });
      doc.image(KwinkLogo, 420, 65, { width: 80 });
    } catch (error) {
      // Fallback if images are not found during generation
      console.error('generateInvoicePdf: failed to load logo images', error);
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
       .text('UPI / Bank Transfer', 380, topBoxY + 30);

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
      doc.text(`Rs. ${item.price.toFixed(0)}`, colPrice, currentY);
      doc.text(`Rs. ${total.toFixed(0)}`, colTotal, currentY);

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
    doc.font(fontRegular).text(`Rs. ${subTotal.toFixed(0)}`, colTotal, currentY);

    doc.font(fontRegular).text(`Tax (${taxRate}%)`, 350, currentY + 20);
    doc.text(`Rs. ${taxAmount.toFixed(0)}`, colTotal, currentY + 20);

    doc.font(fontBold).text('Total', 350, currentY + 45);
    doc.text(`Rs. ${grandTotal.toFixed(0)}`, colTotal, currentY + 45);

    // --- FOOTER ---
    const footerY = tableTop + tableBoxHeight + 40;

    // Contact Us (Left)
    doc.font(fontBold).fontSize(11).text('Contact Us:', 50, footerY);
    doc.font(fontRegular).fontSize(9).fillColor(secondaryColor)
       .text(`Phone Number - ${data.businessPhone || 'N/A'}`, 50, footerY + 15)
       .text(`Address - ${data.businessAddress || 'N/A'}`, 50, footerY + 30, { width: 300 });

    doc.end();
  });
}