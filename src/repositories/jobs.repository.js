const {Op} = require("sequelize");
const {sequelize} = require("../model");
const ApiError = require("../apiError");

const getProfileActiveContractsUnpaidJobs = async (Contract, Job, profileId) => {
    return Contract.findAll({
        where: {
            [Op.or]: [
                { ContractorId: profileId },
                { ClientId: profileId }
            ],
            status: {
                [Op.not]: 'terminated'
            },
        }, include: [{
            model: Job,
            where: {
                paid: {
                    [Op.not]: true
                }
            }
        }]
    }).then(result => result.reduce((acc, curr) => {
            if (curr['Jobs'] && curr['Jobs'].length > 0) {
                return [...acc, ...curr['Jobs']];
            } else {
                return acc;
            }
        }, [])
    );
}

const getClientUnpaidJobById = async (Job, Contract, Profile, jobId, profileId) => {
    return await Job.findOne({
        where: {
            paid: {
                [Op.not]: true
            },
            id: jobId
        }, include: [
            {
                model: Contract,
                where: {
                    status: 'in_progress',
                }, include: {
                    model: Profile,
                    as: 'Client',
                    where: {
                        id: profileId
                    }
                }
            }
        ],
        raw: true
    });
};

const getClientPendingActiveJobsToPayTotalAmount = async (Job, Contract, profileId) => {
   return Job.findAll({
        where: {
            paid: {
                [Op.not]: true
            },
        },
        attributes: [
            [sequelize.fn('SUM', sequelize.col('price')), 'total_price']
        ], include: [
            {
                model: Contract,
                attributes: [],
                where: {
                    status: 'in_progress',
                    ClientId: profileId
                }
            }
        ],
        raw: true
    }).then((result) => result[0].total_price.toFixed(2));
}

const getMostPaidProfessionDateRange = async (Job, Contract, Profile, startDateParsed, endDateParsed) => {
    return await Job.findAll({
        where: {
            paid: true,
            paymentDate: {
                [Op.between]: [startDateParsed, endDateParsed]
            }
        },
        include: [{
            model: Contract,
            attributes: [],
            include: [{
                model: Profile,
                as: 'Contractor',
                attributes: ['profession']
            }]
        }],
        attributes: [
            [sequelize.fn('SUM', sequelize.col('price')), 'totalPrice'],
            [sequelize.col('Contract.Contractor.profession'), 'profession']
        ],
        group: ['Contract.Contractor.profession'],
        order: [[sequelize.literal('totalPrice'), 'DESC']],
        limit: 1,
        raw: true,
    }).then(result => {
        return result[0].profession;
    });
}

const getClientsPaidMostDateRange = async (Job, Contract, Profile, startDateParsed, endDateParsed, limit) => {
    return Job.findAll({
        where: {
            paid: true,
            paymentDate: {
                [Op.between]: [startDateParsed, endDateParsed]
            }
        }, include: [{
            model: Contract,
            attributes: [],
            include: [{
                model: Profile,
                as: 'Client',
                attributes: []
            }]
        }],
        attributes: [
            [sequelize.col('Contract.Client.id'), 'id'],
            [sequelize.literal('firstName || \' \' || lastName'), 'fullName'],
            [sequelize.fn('SUM', sequelize.col('price')), 'paid']
        ],
        order: [[sequelize.literal('paid'), 'DESC']],
        group: ['Contract.Client.id'],
        raw: true,
        limit: limit ? limit : 2
    })
}

const payJob = async (Job, Profile, jobId, clientId, contractorId, price) => {

    const transactionInstance = await sequelize.transaction();

    try {
        await Profile.update({
            balance: sequelize.literal(`balance - ${price}`),
        }, {
            where: {
                id: clientId,
                type: 'client'
            }, transaction: transactionInstance
        });

        await Profile.update({
            balance: sequelize.literal(`balance + ${price}`),
        }, {
            where: {
                id: contractorId,
                type: 'contractor'
            }, transaction: transactionInstance
        });

        await Job.update({ paid: true, paymentDate: new Date() }, {
            where: {
                id: jobId,
                paid: {
                    [Op.not]: true
                }
            }, transaction: transactionInstance
        }).then(result => {
            if (!result[0]) {
                throw new Error();
            }
        });

        await transactionInstance.commit();
        return true;

    } catch (error) {
        await transactionInstance.rollback();
        throw new ApiError(409, 'Job could not be updated due to a conflict');
    }
}

module.exports = {
    getProfileActiveContractsUnpaidJobs,
    getClientPendingActiveJobsToPayTotalAmount,
    getMostPaidProfessionDateRange,
    getClientsPaidMostDateRange,
    getClientUnpaidJobById,
    payJob
};
