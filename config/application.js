const suscriptions = require ('./suscriptions')

const connectionOptions = {
    useNewUrlParser: true,
    useFindAndModify:false,
    useUnifiedTopology: true
}
const port = 80
const hostname = 'localhost'
//const uri = 'mongodb://127.0.0.1:27017'
const uri = 'mongodb+srv://juanmanuelreisz:x4Ms6DN3pCCRzgYV@cluster0.5a9hnwa.mongodb.net/'
const filePath ='public/csv/OutPut.csv'
const difficulty = 2
module.exports.difficulty = difficulty
module.exports.port = port
module.exports.hostname = hostname
module.exports.filePath = filePath
module.exports.mongoConnectionOptions = connectionOptions
module.exports.mongoUri = uri
module.exports.suscriptions = suscriptions



