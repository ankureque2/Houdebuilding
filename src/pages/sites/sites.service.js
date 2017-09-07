"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var SitesService = (function () {
    function SitesService() {
    }
    SitesService.prototype.getSites = function () {
        return [
            {
                "RecordID": 1,
                "PrimaryName": "Monkton Heathfield",
                "ShortCode": "Monkton Heathfield by Somerset County Council/ Taunton Deane ",
                "PostCode": "SON 11D",
                "Address": "Heathfield Road",
                "Telephone": "0234234545",
                "Email": "site@xyz.com",
                "ProgressDate": new Date("2016-07-05").toISOString(),
            },
            {
                "RecordID": 2,
                "PrimaryName": "Acton, London Borough of Ealing ",
                "ShortCode": "Acton, London Borough of Ealing",
                "Address": "Acton Underground Station",
                "PostCode": "UB3 1BN",
                "Telephone": "012365489",
                "Email": "site@xyz.com",
                "ProgressDate": new Date("2016-06-14").toISOString()
            },
            {
                "RecordID": 5,
                "PrimaryName": "South Kilburn Regeneration Developer Framework",
                "ShortCode": "London Borough of Brent",
                "Address": "Kilburn Highstreet",
                "PostCode": "HA5 7GH",
                "Telephone": "0124123654",
                "Email": "site@xyz.com",
                "ProgressDate": new Date("2016-08-10").toISOString()
            },
            {
                "RecordID": 8,
                "PrimaryName": "Riverside Quarter",
                "ShortCode": "Frasers Riverside Quarter Ltd ",
                "Address": "Wandsworth, London ",
                "PostCode": "TBX-0022",
                "Telephone": "013698745",
                "Email": "site@xyz.com",
                "ProgressDate": new Date("2016-08-15").toISOString()
            },
            {
                "RecordID": 10,
                "PrimaryName": "King William Street",
                "ShortCode": "Quarter and Eastern End, Thames View",
                "Address": "King William Street, Quarter and Eastern End, Thames View",
                "PostCode": "NW9 1WQ",
                "Telephone": "0044569875623",
                "Email": "site@xyz.com",
                "ProgressDate": new Date("2016-08-06").toISOString()
            }
        ];
    };
    SitesService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SitesService);
    return SitesService;
}());
exports.SitesService = SitesService;
