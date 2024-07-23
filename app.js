const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./models/database');
const path = require('path');

const app = express();

// Middleware

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const clientRoutes = require('./routes/clients');
const paymentRoutes = require('./routes/payments');


app.use('/api/clients', clientRoutes);
app.use('/api/payments', paymentRoutes);

// Sync Database
sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log('Server is running on port 3001');
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
