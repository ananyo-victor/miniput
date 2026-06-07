import PDFDocument from 'pdfkit';

export interface InvoiceItem {
  name: string;
  code: string;
  qty: number;
  price: number;
}

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  createdAt: string | Date;
  items: InvoiceItem[];
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Order ID: ${data.orderId}`);
    doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString('en-IN')}`);
    doc.text(`Customer: ${data.customerName || 'N/A'}`);
    doc.text(`Phone: ${data.customerPhone}`);
    doc.moveDown();

    const tableTop = doc.y;
    const colItem = 50;
    const colQty = 320;
    const colPrice = 390;
    const colTotal = 470;

    doc.font('Helvetica-Bold');
    doc.text('Item', colItem, tableTop);
    doc.text('Qty', colQty, tableTop);
    doc.text('Price', colPrice, tableTop);
    doc.text('Amount', colTotal, tableTop);
    doc.font('Helvetica');
    doc.moveDown(0.5);
    doc.moveTo(colItem, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    let grandTotal = 0;
    for (const item of data.items) {
      const amount = item.qty * item.price;
      grandTotal += amount;

      const rowY = doc.y;
      doc.text(`${item.name} (${item.code})`, colItem, rowY, { width: 260 });
      doc.text(String(item.qty), colQty, rowY);
      doc.text(`Rs. ${item.price.toFixed(2)}`, colPrice, rowY);
      doc.text(`Rs. ${amount.toFixed(2)}`, colTotal, rowY);
      doc.moveDown();
    }

    doc.moveTo(colItem, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text(`Total: Rs. ${grandTotal.toFixed(2)}`, colTotal, doc.y);

    doc.end();
  });
}
