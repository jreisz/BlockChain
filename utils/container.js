
class container {
  constructor() {
    this.dependencies = {};
    this.factories = {};
  }

  register = (name, dependency) => {
    this.dependencies[name] = dependency;
  }
  factory = (name, factory) => {
    this.factories[name] = factory;
  }
  get = (name) => {
    if (!this.dependencies[name]) {
      const factory = this.factories[name];
      this.dependencies[name] = factory && this.inject(factory);
      if (!this.dependencies[name]) throw new Error(`Cannot find module ${name}`);
    }
    return this.dependencies[name];
  }
  inject = (factory) => {
    var fnArgs = new Array()

    let params = factory.toString().substring(factory.toString().indexOf('(') + 1, factory.toString().indexOf(')'))
    params = params.split(',')

    for (var i = 0; i < params.length; i++) {
      var param = params[i]
      if (param.indexOf('...') === -1) {
        fnArgs[i] = param.trim()
        fnArgs[i] = this.get(fnArgs[i])
      } else {
        var restParam = param.replace('...', '').trim()
        restParam = this.get(restParam.replace('...', '').trim())
        for (var j = 0; j < restParam.length; j++) {
          fnArgs[i + j] = eval(restParam[j].dependence)
        }
      }
    }
    return factory.apply(null, fnArgs);
  }
}

module.exports = container;