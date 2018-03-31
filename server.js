var EXA = require('./lib/expressApp'),
    SVL = require('./lib/serveLecture');

SVL.setUp(EXA.app, EXA.wssconns);