

module.exports = {
    name: 'user',
    version: 1,
    actions: {
        me: async ({meta}) => {
            const {user} = meta;
            return user;
        },
    },

}