const { config } = require("../config");
const { ciruitState } = require('../../../shared/constants/circuit_state');
const { ServiceUnavailableError } = require("../utils/error");
const logger = require("../config/logger");
const axios=require('axios')



class CircuitBreaker {
    constructor(serviceName, threshold = config.CIRCUIT_BREAKER_THRESHOLD, timeout = config.CIRCUIT_BREAKER_TIMEOUT) {
        this.serviceName = serviceName;
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.state = ciruitState.CLOSED;
        this.nextAttempt = Date.now();
    }
    async execute(request) {
        if (this.state === ciruitState.OPEN) {
            if (Date.now() < this.nextAttempt) {
                throw new ServiceUnavailableError(`Service ${this.serviceName} is temprarily unavailable. Circuit Breaker is Open`)
            }
            //try to close the circuit
            this.state = ciruitState.HALF_OPEN;
            logger.info(`circuit breaker ${ciruitState.HALF_OPEN} for ${this.serviceName}`);
        }
        try {
            const response = await request();
            // console.log("respone execute: ",response)
            this.onSuccess();
            return response;
        } catch (error) {
            // console.error(error)
            this.onFailure();
            throw error;
        }
    }
    async onSuccess() {
        this.failureCount = 0;
        if (this.state === ciruitState.HALF_OPEN) {
            this.state = ciruitState.CLOSED;
            logger.info(`Circuit Breaker ${ciruitState.CLOSED} for ${this.serviceName}`)
        }
    }
    async onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.threshold) {
            this.state = ciruitState.OPEN;
            this.nextAttempt = Date.now() + this.timeout;
            logger.error(`circuit breaker ${ciruitState.OPEN} for ${this.serviceName}`)
        }
    }
    getState() {
        return {
            service: this.serviceName,
            state: this.state,
            failureCount: this.failureCount,
            nextAttempt: this.nextAttempt
        }
    }
}

const circuitBreakers = {
    userService: new CircuitBreaker('user_service'),
    adminService:new CircuitBreaker('amin_service')
}

function createProxy(serviceName, serviceUrl) {
    const circuitBreaker = circuitBreakers[serviceName];

    if (!circuitBreaker) {
        throw new Error(`NO circuit breaker found for the service: ${serviceName}`);
    }
    return async (req, res, next) => {
        try {
            // extract the path for the service
            logger.info(`request path: ${req.path} `);
            // console.log(req.body)
            const pathParts = req.path.split('/').filter(Boolean);
            logger.info(`path parts ${pathParts}`);
            const servicePath = '/' + pathParts.slice(1).join('/');
            logger.info(`service path : ${servicePath}`)

            const result = await forwardRequest(
                serviceUrl,
                servicePath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''),//for the query params
                req.method,
                req.body,
                req.headers,
                circuitBreaker
            )

            const setCookies = result.headers?.['set-cookie'];
            if (setCookies?.length) {
                res.setHeader('Set-Cookie', setCookies);
            }

            return res.status(result.status).json(result.data)

        } catch (error) {
            next(error);
        }
    }
}

async function forwardRequest(serviceUrl, path, method, data, headers, circuitBreaker) {
    const url = `${serviceUrl}${path}`
    logger.info(`url path for the service : ${url}`)

    const requestConfig = {
        method,
        url,
        timeout: config.SERVICE_TIMEOUT_MS,
        headers: {
            ...headers,
            host: undefined,
            // Remove content-length to let axios recalculate
            'content-length': undefined,
            // connection: undefined,
        },
        // Important: Don't validate status, let service response through
        validateStatus: () => true,
        // Set max redirects
        maxRedirects: 5,
    }

    // Add data based on method
    if (method !== 'GET' && method !== 'DELETE' && data) {
        requestConfig.data = data;
    }

    // For GET and DELETE, add params if data exists
    if ((method === 'GET' || method === 'DELETE') && data) {
        requestConfig.params = data;
    }

    logger.info(`forwarding request to circuit breaker `)
    // console.log(requestConfig)

    try {
        const response = await circuitBreaker.execute(() => axios(requestConfig));

        // console.log("response",response)

        return {
            status: response.status,
            data: response.data,
            headers: response.headers,
        };
    } catch (error) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new GatewayTimeoutError(`Request to ${serviceUrl} timed out after ${config.SERVICE_TIMEOUT_MS}ms`);
        }

        if (error.code === 'ECONNREFUSED') {
            throw new ServiceUnavailableError(`Cannot connect to ${serviceUrl}. Service may be down.`);
        }

        if (error.response) {
            logger.error(`Service error from ${serviceUrl}:`, {
                status: error.response.status,
                data: error.response.data,
            });

            return {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
            };
        }

        // Network error or service down
        logger.error(`Network error while calling ${serviceUrl}: ${error.message}`);
        throw new ServiceUnavailableError(`Service temporarily unavailable: ${error.message}`);
    }

}

function getCircuitBreakerStatus() {
    return Object.values(circuitBreakers).map((value) => value.getState())
}
module.exports = {
    createProxy,
    CircuitBreaker,
    circuitBreakers,
    getCircuitBreakerStatus
}
