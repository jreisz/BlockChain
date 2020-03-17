
module.exports = (model, blockService, fileService) => {

    const logController = {}

    logController.index = (req, res) => {
        res.render('index');
    }
    logController.getEntries = async (req, res) => {
        // req.callback = logController.getDBEntryByPrevHash
        // return fileService.readLine(req, res)
        const entries = await logController.getDBEntries(req, res)
        return res.send(entries)
    }
    logController.getDBEntries = async (req, res) => {
        return model.find()
            .exec()
            .then(async results => {
                return results
            })
    }
    logController.getDBEntryByPrevHash = (prev_hash) => {
        return model.findOne({ 'prev_hash': prev_hash }).exec()
            .then(entity => {
                return { entity: entity }
            })
    }
    logController.add = async (req, res) => {
        console.log('logController.add')
        const blockServiceResponse = await blockService.addBlock(req, res)
        return res.status(200).json({ errors: [], message: blockServiceResponse.message })

        // if (blockServiceResponse.success) {
        //     console.log('e')
        //     return res.status(422).json({ errors: [], message: blockServiceResponse.message })
        //     //const dbEntries = await logController.getDBEntries(req, res)
        //     //req.dbEntries = dbEntries

        //     //return await fileService.syncFile(req, res)

        // } else {
        //     return res.status(422).json({ errors: [], message: blockServiceResponse.message })
        // }
    }
    logController.edit = (req, res) => {
        return blockService.editBlock(req, res)
    }
    logController.delete = async (req, res) => {
        console.log(req.params)
        const { id } = req.params
        await model.remove({ _id: id })
        res.redirect('/');
    }
    logController.checkIntegrity = async (req, res) => {
        const response = await blockService.checkIntegrity(req, res)
        return res.json({ message: response.message, success: response.success })
    }
    logController.recalcNonces = async (req, res) => {
        return blockService.recalcNonces(req, res)
    }
    return logController;
}



