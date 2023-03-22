const JobsRepository = require("../repositories/jobs.repository");
const ProfilesRepository = require("../repositories/profiles.repository");
const ApiError = require("../apiError");

const addBalanceToClient = async (Job, Contract, Profile, profileId, addToBalance) => {
    const pendingPaymentAmount = await JobsRepository.getClientPendingActiveJobsToPayTotalAmount(Job, Contract, profileId);
    const clientCurrentBalance = await ProfilesRepository.getBalance(Profile, profileId, 'client');
    const maxAllowedDeposit = pendingPaymentAmount * 0.25;

    if (addToBalance > maxAllowedDeposit) {
        throw new ApiError(409, 'deposit limit exceeded');
    } else {
        return ProfilesRepository.addBalance(Profile, profileId, addToBalance, clientCurrentBalance);
    }
}

module.exports = {
    addBalanceToClient
};
