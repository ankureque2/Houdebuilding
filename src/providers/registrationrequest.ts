export class RegistrationRequest{
ApplicationId: string = 'C754D0B1-4A83-4F2E-94E1-0F9433FAC87C';
ActivationCode: string;
DeviceName: string;

constructor(activeCode: string, device:string){
    this.ActivationCode = activeCode;
    this.DeviceName = device;

  }
}

export class RegistrationResponse{
StatusCode: number;
AccessToken: string;
error: string;

  constructor(){
    
  }

}