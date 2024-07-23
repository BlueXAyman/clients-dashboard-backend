const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const Client = require('../models/client');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure the receipts directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Add payment
router.post('/', async (req, res) => {
  const { startMonth, startYear, endMonth, endYear, amount, clientId, months, paymentDate, paymentTime } = req.body;
  try {
    const payment = await Payment.create({
      startMonth,
      startYear,
      endMonth,
      endYear,
      amount,
      clientId,
      months,
      paymentDate,
      paymentTime
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete payment by ID
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (payment) {
      await payment.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a payment by ID
router.put('/:id', async (req, res) => {
  try {
    const { startMonth, startYear, endMonth, endYear, amount, months } = req.body;
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.startMonth = startMonth;
    payment.startYear = startYear;
    payment.endMonth = endMonth;
    payment.endYear = endYear;
    payment.amount = amount;
    payment.months = months;


    await payment.save();
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate receipt by payment ID
router.get('/receipt/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: {
        model: Client,  // Include the Client model
        attributes: ['firstName', 'lastName']
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const doc = new PDFDocument();
    const receiptsDir = path.join(__dirname, '..', 'public', 'receipts');
    ensureDir(receiptsDir);

    let filename = `receipt_${payment.id}.pdf`;
    const filePath = path.join(receiptsDir, filename);

    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(16).text('Statement of Receipt', { align: 'center' });
    doc.fontSize(12).text(` `);
    doc.fontSize(12).text(` `);
    doc.fontSize(12).text(`Paid to: Ecole Le Message`);
    doc.fontSize(12).text(`In behalf of: ${payment.Client.firstName} ${payment.Client.lastName}`);
    doc.fontSize(12).text(`Payment ID: ${payment.id} (${payment.paymentTime})`);
    doc.fontSize(12).text(`Paid on: ${payment.paymentDate}`);
    doc.fontSize(12).text(` `);
    doc.text(`Start Date: ${payment.startMonth}/${payment.startYear}`);
    doc.text(`End Date: ${payment.endMonth}/${payment.endYear}`);
    doc.fontSize(12).text(` `);
    doc.fontSize(12).text(`--------------------------------------------------------------------------------------------------------- `);
    doc.text(`Amount Paid:                                                                                        ${payment.amount} MAD`);
    doc.end();

  
      // Respond with the file path or URL where the file can be accessed
      res.json({ url: `/receipts/${filename}` });
    } catch (error) {
      console.error('Error generating receipt:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
module.exports = router;
