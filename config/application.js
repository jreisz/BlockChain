const suscriptions = require ('./suscriptions')

const connectionOptions = {
    useNewUrlParser: true,
    useFindAndModify:false,
    useUnifiedTopology: true
}
const port = 3456
const hostname = 'localhost'
const uri = 'mongodb://localhost/ConcurrentQueue'
const filePath ='public/csv/OutPut.csv'
const difficulty = 2

module.exports.difficulty = difficulty
module.exports.port = port
module.exports.hostname = hostname
module.exports.filePath = filePath
module.exports.mongoConnectionOptions = connectionOptions
module.exports.mongoUri = uri
module.exports.suscriptions = suscriptions



