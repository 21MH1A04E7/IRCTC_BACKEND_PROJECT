const { config } = require("../config");
const {ciruitState}=require('../../../shared/constants/circuit_state')



class CiruitBreaker{
    constructor(serviceName,threshold,timeout){
        this.serviceName=serviceName;
        this.threshold=threshold;
        this.timeout=timeout;
        this.failureCount=0;
        this.state=ciruitState.CLOSE;
        this.nextAttempt=Date.now();
    }
}