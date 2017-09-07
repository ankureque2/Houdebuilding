export class RegistrationInfo{
activationCode: string;
connected: boolean;
accesstoken: string;
customerno: string;
customername: string;
instancedescription: string;
relaychannel: number;
userid: number;

constructor(code:string, connected:boolean, accesstoken: string, custNo: string,
             custName: string, instance: string, relay: number, userId: number)
    {
        this.activationCode = code;
        this.connected = connected;
        this.accesstoken = accesstoken;
        this.customerno = custNo;
        this.customername = custName;
        this.instancedescription = instance;
        this.relaychannel = relay;
        this.userid = userId;       
    }
}