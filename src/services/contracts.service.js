const ContractsRepository = require("../repositories/contracts.repository");

const getProfileContract = (Contract, Profile, contractId, profileId) => {
    return ContractsRepository.getProfileContractById(Contract, Profile, contractId, profileId);
}

const getNonTerminatedContracts = (Contract, profileId) => {
    return ContractsRepository.getProfileNonTerminatedContracts(Contract, profileId);
}

module.exports = {
    getProfileContract,
    getNonTerminatedContracts
};



