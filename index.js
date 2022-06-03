const { ServiceBroker } = require("moleculer");

const broker = new ServiceBroker();

broker.createService({
    name: 'test',
    version: 1,
    settings: {
      port: 4112
    },
    actions: {
        test: ctx => 'test'
    }
});

broker