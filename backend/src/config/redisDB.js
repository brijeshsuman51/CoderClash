const{ createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_KEY,
    socket: {
        host: 'redis-16459.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16459
    }
});


module.exports = redisClient;