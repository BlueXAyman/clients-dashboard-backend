const express = require('express');
const router = express.Router();
const Client = require('../models/client');
const Payment = require('../models/payment');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');


// Get all clients
router.get('/', async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get a client by ID
router.get('/:id', async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id, { include: Payment });
        if (client) {
            res.json(client);
        } else {
            res.status(404).json({ error: 'Client not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get clients who haven't paid in the current month
router.get('/unpaid/currentMonth', async (req, res) => {
    try {
      const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so +1 to match 1-12
      const currentYear = new Date().getFullYear();
  
      // Get all clients
      const clients = await Client.findAll({
        include: {
          model: Payment,
          where: {
            [Op.and]: [
              { startYear: { [Op.lte]: currentYear } },
              { endYear: { [Op.gte]: currentYear } },
              {
                [Op.or]: [
                  { startMonth: { [Op.lte]: currentMonth, [Op.gte]: 1 } },
                  { endMonth: { [Op.gte]: currentMonth, [Op.lte]: 12 } }
                ]
              }
            ]
          },
          required: false
        }
      });
  
      // Filter clients who haven't paid in the current month
      const unpaidClients = clients.filter(client => {
        const payments = client.Payments;
        return !payments.some(payment => {
          const startDate = new Date(payment.startYear, payment.startMonth - 1);
          const endDate = new Date(payment.endYear, payment.endMonth - 1);
          const currentDate = new Date(currentYear, currentMonth - 1);
          return startDate <= currentDate && endDate >= currentDate;
        });
      });
  
      res.json(unpaidClients);
    } catch (error) {
      console.error('Error fetching unpaid clients:', error);  // Log the full error
      res.status(500).json({ error: 'Server error' });
    }
  });
  
router.post('/', async (req, res) => {
    const { firstName, lastName, number, branch } = req.body;

    try {
        // Check if a client with the same number already exists
        const existingClient = await Client.findOne({ where: { number } });
        
        if (existingClient) {
            return res.status(400).json({ error: 'Client with this number already exists' });
        }
        if (isNaN(number)) {
            return res.status(400).json({ error: 'Number must be a valid number' });
        }
        // If no client with the same number exists, create a new client
        const newClient = await Client.create({ firstName, lastName, number, branch });
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
  

// Update a client by ID
router.put('/:id', async (req, res) => {
    const { firstName, lastName, number, branch } = req.body;
    try {
        // Check if a client with the same number already exists and is not the current client
        const existingClient = await Client.findOne({ where: { number, id: { [Sequelize.Op.ne]: req.params.id } } });
        
        if (existingClient) {
            return res.status(400).json({ error: 'Client with this number already exists' });
        }
        
        if (isNaN(number)) {
            return res.status(400).json({ error: 'Number must be a valid number' });
        }
        
        const client = await Client.findByPk(req.params.id);
        if (client) {
            client.firstName = firstName;
            client.lastName = lastName;
            client.number = number;
            client.branch = branch;
            await client.save();
            res.json(client);
        } else {
            res.status(404).send('Client not found');
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


// Delete a client by ID
router.delete('/:id', async (req, res) => {
    try {
        const clientId = req.params.id;
        const client = await Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        await client.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
