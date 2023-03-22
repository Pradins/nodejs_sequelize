const express = require('express')
const router = express.Router();
const JobsService = require("../services/jobs.service");

/**
 * @returns all unpaid jobs for a user with an active contract
 */
router.get('/unpaid', async (req, res, next) => {
    const {Contract, Job} = req.app.get('models')

    try {
        const jobs = await JobsService.getActiveContractsUnpaidJobs(Contract, Job, req.profile.id)
        res.json(jobs)
    } catch (error) {
        next(error);
    }
})

/**
 * @returns true if the requested job have been successfully paid to the contractor
 */
router.post('/:job_id/pay', async (req, res, next) => {
    const {Contract, Profile, Job} = req.app.get('models')
    const { job_id: jobId } = req.params;
    const profileId = req.profile.id;

    try {
        const result = await JobsService.payJobToContractor(Contract, Profile, Job, jobId, profileId);
        res.json(result);
    } catch (error) {
        next(error);
    }
})

module.exports = router;
