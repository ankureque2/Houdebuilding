import {ISite} from '../pages/sites/site'

export class SiteServiceResponseMessage{
MessageCode: number;
Sites: any;
DispatchCode: number

}

export class SiteData{
   returnCode: number;
   returnMessage: string;
   returnData: ISite[];
   returnCount: number; 
}