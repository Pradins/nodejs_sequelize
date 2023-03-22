const express = require('express')
const router = express.Router();
const JobsService = require("../services/jobs.service");

/**
 * @returns most paid profession between a range of dates
 */
router.get('/best-profession', async (req, res, next) => {
    const {Contract, Job, Profile} = req.app.get('models')
    const { start, end } = req.query;

    try {
        const mostPaidProfession = await JobsService.getMostPaidProfession(Job, Contract, Profile, start, end);
        res.json({'result': mostPaidProfession});
    } catch (error) {
        next(error);
    }
});

/**
 * @returns clients who paid the most between a range of dates
 */
router.get('/best-clients', async (req, res, next) => {
    const {Contract, Job, Profile} = req.app.get('models')
    const { start, end, limit } = req.query;

    try {
        const clientsPaidMost = await JobsService.getClientsPaidMost(Job, Contract, Profile, start, end, limit);
        res.json({result: clientsPaidMost});
    } catch (error) {
        next(error);
    }
});

module.exports = router;
