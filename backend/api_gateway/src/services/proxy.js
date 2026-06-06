const { config } = require("../config");
const { ciruitState } = require('../../../shared/constants/circuit_state');
const { ServiceUnavailableError } = require("../utils/error");
const logger = require("../config/logger");



class CiruitBreaker {
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
            try {
                const response = await request();
                this.onSuccess();
                return response;
            } catch (error) {
                this.onFailure();
                throw error;
            }
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
    getState(){
        return {
            service:this.serviceName,
            state:this.state,
            failureCount:this.failureCount,
            nextAttempt:this.nextAttempt
        }
    }
}

const circuitBreaker={
    userService:new CiruitBreaker('user_service');
}