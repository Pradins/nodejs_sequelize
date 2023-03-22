const {Op} = require("sequelize");

const getProfileContractById = async (Contract, Profile, contractId, profileId) => {
    return Contract.findOne({
        where: {
            id: contractId,
            [Op.or]: [
                { ContractorId: profileId },
                { ClientId: profileId }
            ]
        }
    });
}

const getProfileNonTerminatedContracts = async (Contract, profileId) => {
    return Contract.findAll({
        where: {
            status: {
                [Op.not]: 'terminated'
            },
            [Op.or]: [
                { ContractorId: profileId },
                { ClientId: profileId }
            ]
        }
    })
}


module.exports = {
    getProfileContractById,
    getProfileNonTerminatedContracts
};
