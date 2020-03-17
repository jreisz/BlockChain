
const conf = require('./config/application')
const {router,app,express} = require("./config/routes")
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path')


mongoose.connect(conf.mongoUri, conf.mongoConnectionOptions)
            .then(db => console.log('Db Connected.'))
            .catch(err => console.log(err))

app.set("port", process.env.PORT || conf.port)
app.set("hostname", conf.hostname)
app.set('views', path.join(__dirname, 'app/views'))
app.set('view engine', 'ejs')

app.use(morgan('dev'))
app.use(express.static("public"))
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router)

app.listen(app.get('port'), conf.hostname, () => {
    console.log(`Server running at http://${app.get('hostname')}:${app.get('port')}/`)
});
module.exports.app=app