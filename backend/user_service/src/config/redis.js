const Redis=require('ioredis')
const { config } = require('./index');
const logger = require('./logger');

class RedisClient {
    static #instance = null;

    #client = null;
    #isConnected = false;

    constructor() {
        if (RedisClient.#instance) {
            return RedisClient.#instance;
        }
        RedisClient.#instance = this;
    }

    static getInstance() {
        if (!RedisClient.#instance) {
            RedisClient.#instance = new Redis(config.REDIS_URL,{
                
            });
        }
        return RedisClient.#instance;
    }

    async connect() {
        if (this.#isConnected && this.#client?.isOpen) {
            return this.#client;
        }

        this.#client = createClient({ url: config.REDIS_URL });

        this.#client.on('error', (err) => {
            logger.error(`Redis client error: ${err.message}`);
        });

        this.#client.on('connect', () => {
            logger.info('Redis connecting');
        });

        this.#client.on('ready', () => {
            logger.info('Redis connected');
        });

        await this.#client.connect();
        this.#isConnected = true;
        return this.#client;
    }

    getClient() {
        if (!this.#client?.isOpen) {
            throw new Error('Redis client is not connected. Call connect() first.');
        }
        return this.#client;
    }

    async disconnect() {
        if (!this.#client?.isOpen) {
            return;
        }
        await this.#client.quit();
        this.#isConnected = false;
        logger.info('Redis disconnected');
    }

    async ping() {
        const client = this.getClient();
        return client.ping();
    }
}

module.exports = RedisClient;
