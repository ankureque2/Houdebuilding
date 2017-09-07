"use strict";
var RegistrationInfo = (function () {
    function RegistrationInfo(code, connected, housebuildingServer) {
        this.activationCode = code;
        this.connected = connected;
        this.housebuildingServerName = housebuildingServer;
    }
    return RegistrationInfo;
}());
exports.RegistrationInfo = RegistrationInfo;
