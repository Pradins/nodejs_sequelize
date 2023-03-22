const express = require('express')
const router = express.Router();
const ContractsService = require("../services/contracts.service");
const ApiError = require("../apiError");

/**
 * @returns contract by id that belongs to a profile
 */
router.get('/:id', async (req, res, next) => {
    const { Contract, Profile } = req.app.get('models')
    const { id } = req.params

    try {
        const contract = await ContractsService.getProfileContract(Contract, Profile, id, req.profile.id);
        if (!contract) throw new ApiError(404, 'Not found')
        res.json(contract)
    } catch (error) {
        next(error);
    }
})

/**
 * @returns all non terminated contracts that belong to a profile
 */
router.get('/', async (req, res, next) => {
    const {Contract} = req.app.get('models')

    try {
        const contracts = await ContractsService.getNonTerminatedContracts(Contract, req.profile.id);
        res.json(contracts)
    } catch (error) {
        next(error);
    }
})

module.exports = router;
