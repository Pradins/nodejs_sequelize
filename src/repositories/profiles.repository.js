const ApiError = require("../apiError");
const getBalance = async (Profile, profileId, type) => {
    return Profile.findOne({
        where: {
            id: profileId,
            type: type
        },
        attributes: ['balance'],
        raw: true
    }).then(result => result.balance);
}

const addBalance = async (Profile, profileId, amount, balanceBeforeUpdate) => {
    return Profile.increment('balance', {
        by: amount,
        where: {
            id: profileId,
            balance: balanceBeforeUpdate
        }
    })
    .then((result) => {
        const numRowsUpdated = result[0][1];
        if (!numRowsUpdated) {
            throw new ApiError('409', 'Balance could not be added due to a conflict');
        }
    })
}

module.exports = {
    getBalance,
    addBalance,
};
