const express = require('express');
const bodyParser = require('body-parser');

const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');

// Routes
const balancesRouter = require('./routes/balances.routes');
const adminRouter = require('./routes/admin.routes');
const jobsRouter = require('./routes/jobs.routes');
const contractsRouter = require('./routes/contracts.routes');
const ApiError = require("./apiError");

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use(getProfile);

app.use('/balances', balancesRouter);
app.use('/admin', adminRouter);
app.use('/jobs', jobsRouter);
app.use('/contracts', contractsRouter);

// Error handling
app.use((error, req, res, next) => {
    if(error instanceof ApiError) {
        res.status(error.code).json(error.message);
        return;
    }
    res.status(500).json('something went wrong!');
    next();
});

module.exports = app;
