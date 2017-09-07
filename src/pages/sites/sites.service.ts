import {Injectable} from '@angular/core';
import {ISite} from './site';

@Injectable()
export class SitesService{

    getSites(): ISite[]{
    return [
    {
        "recordID": 1,
        "primaryName": "Monkton Heathfield",
        "shortCode": "Monkton Heathfield by Somerset County Council/ Taunton Deane ",
        "postCode": "SON 11D",
        "address": "Heathfield Road",       
        "telephone": "0234234545",
        "email": "site@xyz.com",
        "progressDate": new Date("2016-07-05").toISOString(),
    },
    {
        "recordID": 2,
        "primaryName": "Acton, London Borough of Ealing ",
        "shortCode": "Acton, London Borough of Ealing",
        "address": "Acton Underground Station",
        "postCode": "UB3 1BN",
        "telephone": "012365489",
        "email": "site@xyz.com",
        "progressDate": new Date("2016-06-14").toISOString()
      },
    {
        "recordID": 5,
        "primaryName": "South Kilburn Regeneration Developer Framework",
        "shortCode": "London Borough of Brent",
        "address": "Kilburn Highstreet",
        "postCode": "HA5 7GH",
        "telephone": "0124123654",
        "email": "site@xyz.com",
        "progressDate": new Date("2016-08-10").toISOString()
    },
    {
        "recordID": 8,
        "primaryName": "Riverside Quarter",
        "shortCode": "Frasers Riverside Quarter Ltd ",
        "address": "Wandsworth, London ",
         "postCode": "TBX-0022",
        "telephone": "013698745",
        "email": "site@xyz.com",
        "progressDate": new Date("2016-08-15").toISOString()     
    },
    {
        "recordID": 10,
        "primaryName": "King William Street",
        "shortCode": "Quarter and Eastern End, Thames View",       
        "address": "King William Street, Quarter and Eastern End, Thames View",
        "postCode": "NW9 1WQ",
        "telephone": "0044569875623",
        "email": "site@xyz.com",
        "progressDate": new Date("2016-08-06").toISOString()   
    }
]}

}