const registeredControllers =
    [
        {
            name: 'logController',
            dependences: [
                {
                    name: 'model',
                    dependence: 'require(\'../app/models/entry\')'
                },
                {
                    name: 'blockService',
                    dependence: 'require(\'../app/services/blockService\')'
                },
                {
                    name: 'fileService',
                    dependence: 'require(\'../app/services/fileService\')'
                }
            ],
            verbs: [
                {
                    name: 'get',
                    any: ['index', 'getEntries', 'delete'],
                }, 
                {
                    name: 'post',
                    any: ['add', 'edit', 'checkIntegrity', 'recalcNonces'],
                }
            ],
            validationRules: 'logValidator'
        }
    ]
module.exports.registeredControllers = registeredControllers