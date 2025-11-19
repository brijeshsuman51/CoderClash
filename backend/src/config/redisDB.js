const{ createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_KEY,
    socket: {
        host: 'redis-19495.crce206.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 19495
    }
});

module.exports = redisClient;