
const crypto = require("crypto");
const format = require('biguint-format');
const Entry = require('../models/entry')
const { difficulty } = require('../../config/application')

exports.addBlock = (req, res) => {
    let success = true
   
    return Entry.find()
        .exec()
        .then(async results => {

            const count = results.length
            if (count === 0) {
                const chain = [generateGenesisBlock(req.body.message)]

                let entry = new Entry()
                entry.message = req.body.message
                entry.prev_hash = chain[0].prev_hash
                entry.hash = chain[0].hash
                entry.nonce = chain[0].nonce
                await entry.save()

                return { message: 'Entry Added.', success: success }
            }
            else {
                return await Entry.findOne({}, {}, { sort: { '_id': -1 } }, function (err, post) {

                }).then(async post => {
                    
                    console.log(post)
                    const newBlock = addBlock(post.hash, req.body.message)
                    console.log(newBlock)

                    let entry = new Entry()
                    entry.message = req.body.message
                    entry.prev_hash = post.hash
                    entry.hash = newBlock.hash
                    entry.nonce = newBlock.nonce
                    await entry.save()

                    return { message: 'Entry Added.', success: success }
                });
            }
        });
}
exports.editBlock = (req, res) => {
    Entry.update(
        { _id: req.body._id },
        { message: req.body.message }
    ).then((rawResponse) => {

    })
        .catch((err) => {
            return res.status(422).json({ message: 'Error updating Message.' });
        });

    return res.status(200).json({ message: '' });
}
exports.checkIntegrity = (req, res) => {
    var msg = 'Integrity check: Success.'
    var success = true

    return Entry.find()
        .exec()
        .then(results => {

            const count = results.length
            if (count === 0) {
                msg = 'No Entries to evaluate.'
                success = false
            }
            else {
                let nonce, message, prev_hash, hash
                if (count === 1) {
                    nonce = results[0].nonce
                    message = results[0].message
                    prev_hash = results[0].prev_hash
                    hash = crypto.createHash('sha256').update(prev_hash + ',' + message + ',' + nonce).digest('hex').toString();

                    if (prev_hash.length !== 64) {
                        msg = 'Integrity check: Failure. prev_hash not sha256'
                        success = false
                    } else if (results[0].hash.length !== 64) {
                        msg = 'Integrity check: Failure. hash not sha256'
                        success = false
                    } else if (isNaN(nonce)) {
                        msg = 'Integrity check: Failure. nonce not numeric'
                        success = false
                    } else if (hash !== results[0].hash) {
                        msg = 'Integrity check: Failure. Message doesn´t correspond to Nonce. Message was changed without \'Recalculate Nonces\' or Nonce was editted'
                        success = false
                    }
                }
                else {
                    for (let i = 0; i < results.length; i++) {
                        nonce = results[i].nonce
                        message = results[i].message
                        prev_hash = results[i].prev_hash
                        hash = crypto.createHash('sha256').update(prev_hash + ',' + message + ',' + nonce).digest('hex').toString();

                        if (prev_hash.length !== 64) {
                            msg = 'Integrity check: Failure. prev_hash not sha256'
                            success = false
                            break
                        } else if (results[i].hash.length !== 64) {
                            msg = 'Integrity check: Failure. hash not sha256'
                            success = false
                            break
                        } else if (isNaN(nonce)) {
                            msg = 'Integrity check: Failure. nonce not numeric'
                            success = false
                            break
                        } else if (hash !== results[i].hash) {
                            msg = 'Integrity check: Failure. Message doesn´t correspond to Nonce. Message was changed without \'Recalculate Nonces\' or Nonce was editted'
                            success = false
                            break
                        } else if (i != 0) {
                            if (results[i].prev_hash !== results[i - 1].hash) {
                                msg = 'Integrity check: Failure. prev_hash differs from expected prev_hash.'
                                success = false
                                break
                            }
                        }
                    }
                }
            }
            return { message: msg, success: success }
        })
        .catch(err => errorHandler.handle('blockService', err));

}
exports.recalcNonces = async (req, res) => {
    var msg = 'Regenerate Nonces: Success.'
    var success = true

    const response = await this.checkIntegrity(req, res)
    if (response.message === 'No Entries to evaluate.') {
        return res.status(200).json({ message: response.message, success: false })
    }
    else if (response.success === true) {
        return res.status(200).json({ message: 'Check Integrity: Successful. No need to Regenerate Nonces.', success: true })
    } else {

        Entry.find().exec(async function (err, results) {
            let block
            for (let i = 0; i < results.length; i++) {

                if (i === 0) {
                    block = generateGenesisBlock(results[0].message)
                    //let chain = [regenerateNonce(results[0].prev_hash, results[0].hash, results[0].message)];
                    await Entry.findByIdAndUpdate(results[0].id,
                        {
                            message: block.message,
                            prev_hash: block.prev_hash,
                            hash: block.hash,
                            nonce: block.nonce
                        },
                        (err, result) => { })
                }
                else {
                    block = addBlock(block.hash, results[i].message)
                    await Entry.findByIdAndUpdate(results[i].id,
                        {
                            message: block.message,
                            prev_hash: block.prev_hash,
                            hash: block.hash,
                            nonce: block.nonce
                        },
                        (err, result) => { })
                }
            }
            return res.status(200).json({ message: msg, success: success })
        });
    }
}
function calculateHash({ prev_hash, message, nonce = 1 }) {
    var stay = true
    let hash
    while (stay) {
        nonce = format(crypto.randomBytes(16), 'dec');
        hash = crypto.createHash('sha256').update(prev_hash + ',' + message + ',' + nonce).digest('hex').toString();

        console.log(hash);

        var regex = new RegExp("^" + new Array(difficulty + 1).join('0') + ".*");

        if (regex.exec(hash) !== null) {
            stay = false
        }
    }
    return { hash: hash, nonce: nonce };
}
function generateGenesisBlock(message) {
    const block = {
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
        message: message
    };
    return {
        ...block,
        ...calculateHash(block)
    }
}
function addBlock(prev_hash, message) {
    const block = {
        prev_hash: prev_hash,
        message: message
    };
    return {
        ...block,
        ...calculateHash(block)
    }
}
function regenerateNonce(prev_hash, hash, message) {
    var stay = true
    let testHash
    while (stay) {
        nonce = format(crypto.randomBytes(16), 'dec');
        testHash = crypto.createHash('sha256').update(prev_hash + ',' + message + ',' + nonce).digest('hex').toString();

        console.log(testHash);

        var regex = /^00.*/;

        if (regex.exec(testHash) !== null && testHash === hash) {
            stay = false
        }
    }
    return { hash: hash, nonce: nonce, prev_hash: prev_hash, message: message };
}
