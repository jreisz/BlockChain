const fs = require('fs')
const readLine = require('readline')

exports.readLine = async (req, res) => {
    const fileStream = fs.createReadStream(req.app.get("Configuration").filePath);
    const rl = readLine.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let i = 0    
    const dbEntities = new Array()

    for await (const line of rl) {
        let arrLine = line.split(',')
        let dbEntity = await req.callback(arrLine[0]/*, filter*/)
        dbEntities[i] = dbEntity.entity
        i++
    }
    res.send(dbEntities)
}
exports.syncFile = async (req, res) => {
    
    
    return res.status(200).json({ message: 'File Synced.' })
}

