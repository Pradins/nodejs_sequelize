const express = require('express')
const router = express.Router();
const ProfilesService = require("../services/profiles.service");

/**
 * @returns true if the deposit was successful
 */
router.post('/deposit/:userId', async (req, res, next) => {
    const {Contract, Job, Profile} = req.app.get('models')
    const {userId: profileId} = req.params;
    const { addToBalance } = req.body;

    try {
        const result = await ProfilesService.addBalanceToClient(Job, Contract, Profile, profileId, addToBalance );
        res.json(result)
    } catch (error) {
        next(error);
    }
});

module.exports = router;
