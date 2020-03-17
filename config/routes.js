
const express = require('express')
const app = express()
const router = express.Router();
const configuration = require('./application')
const validator = require('../utils/validator')

app.set("Configuration", configuration)

const Container = require('../utils/container');
const container = new Container();

for (var key in configuration.suscriptions["registeredControllers"]) {
    const _controller = configuration.suscriptions["registeredControllers"][key];
    const validationRules = require('../app/validators/'+ _controller.validationRules)

    container.register('app', app);
    for (var k2 in _controller.dependences) {
        container.register(_controller.dependences[k2].name, eval(_controller.dependences[k2].dependence));
    }
    container.factory(_controller.name, require('../app/controllers/' + _controller.name));
    
    const controller = container.get(_controller.name);
   
    let any = ''
    for (var k3 in _controller.verbs) {
        if (_controller.verbs[k3].name === 'get') {
            for (var k4 in _controller.verbs[k3].any) {
                any = _controller.verbs[k3].any[k4];
                if (any === "index") {
                    router.get('/', controller.index);
                } else if (any === "edit" || any === "delete") {
                    router.get('/' + any + '/:id', controller[any]);
                } else {
                    router.get('/' + any, controller[any]);
                }
            }
        } else if (_controller.verbs[k3].name === 'post') {
            for (var k5 in _controller.verbs[k3].any) {
                any = _controller.verbs[k3].any[k5];
                if (any === "index") {
                    router.post('/', validationRules[any]() , validator.validate, controller[any]);
                } else {
                    router.post('/' + any, validationRules[any]() , validator.validate, controller[any]);
                }
            }
        } else {
            console.log(k5)
        }
    }
}

module.exports.router = router
module.exports.app = app
module.exports.express = express
