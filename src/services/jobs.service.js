const JobsRepository = require("../repositories/jobs.repository");
const ProfilesRepository = require("../repositories/profiles.repository");
const ApiError = require("../apiError");

const getActiveContractsUnpaidJobs = async (Contract, Job, profileId) => {
    return JobsRepository.getProfileActiveContractsUnpaidJobs(Contract, Job, profileId);
}

const getClientPendingPayments = async (Job, Contract, profileId) => {
    return JobsRepository.getClientPendingActiveJobsToPayTotalAmount(Job, Contract, profileId);
}

const getMostPaidProfession = async (Job, Contract, Profile, start, end) => {
    const startDateParsed = new Date(start).setUTCHours(0, 0, 0, 0);
    const endDateParsed = new Date(end).setUTCHours(23, 59, 59, 999);
    return JobsRepository.getMostPaidProfessionDateRange(Job, Contract, Profile, startDateParsed, endDateParsed);
}

const getClientsPaidMost = async (Job, Contract, Profile, start, end, limit) => {
    const startDateParsed = new Date(start).setUTCHours(0, 0, 0, 0);
    const endDateParsed = new Date(end).setUTCHours(23, 59, 59, 999);
    return await JobsRepository.getClientsPaidMostDateRange(Job, Contract, Profile, startDateParsed, endDateParsed, limit);
}

const payJobToContractor = async (Contract, Profile, Job, jobId, profileId) => {
    const clientBalance = await ProfilesRepository.getBalance(Profile, profileId, 'client')

    if (clientBalance <= 0) {
        throw new ApiError(409, 'Client has not enough balance');
    }

    const clientJobToPay = await JobsRepository.getClientUnpaidJobById(Job, Contract, Profile, jobId, profileId)

    if (!clientJobToPay) {
        throw new ApiError(404, 'Job not found');
    }

    if (clientJobToPay.price > clientBalance) {
        throw new ApiError(409, 'Insuficient balance');
    }

    return await JobsRepository.payJob(Job, Profile, jobId, profileId, clientJobToPay['Contract.ContractorId'], clientJobToPay.price);
}

module.exports = {
    getActiveContractsUnpaidJobs,
    getClientPendingPayments,
    getMostPaidProfession,
    getClientsPaidMost,
    payJobToContractor
};
