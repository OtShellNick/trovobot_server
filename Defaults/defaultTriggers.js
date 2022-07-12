const TRIGGERS = [
    {
        name: 'test',
        description: 'test',
        command: '!test',
        action: 'message',
        message: 'test message'
    },
    {
        name: 'set default role',
        description: 'set default role',
        command: null,
        action: 'setRole',
        message: '{nickName} становится ${role} на канале ${channelName}'
    },
    {
        name: 'welcome',
        description: 'welcome',
        command: null,
        action: 'welcome',
        message: '@{nickName} добро пожаловать на канал! :shocked Устраивайся по удобнее, приятного просмотра)'
    }
];

module.exports = {TRIGGERS}