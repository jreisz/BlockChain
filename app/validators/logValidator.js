
const { check } = require('express-validator')

const add = () => {
    return [
        check('message').notEmpty().withMessage('Empty Message. Insert Message to add new line.')
    ]
}
const edit = () => {
    return [
        check('message').notEmpty().withMessage('Empty Message. Insert Message to apply changes.')
    ]
}
const checkIntegrity = () => {
    return []
}
const recalcNonces = () => {
    return []
}
module.exports.add = add
module.exports.edit = edit
module.exports.checkIntegrity = checkIntegrity
module.exports.recalcNonces = recalcNonces