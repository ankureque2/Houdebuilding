import { Injectable } from '@angular/core';
import {SQLite} from 'ionic-native';
import {Platform} from 'ionic-angular';
import {DownloadedSite} from '../pages/sites/site';
import {ISite} from '../pages/sites/site';
import {RegistrationInfo} from '../pages/register/registrationdata';
import {ConstructionStage, ConstructionStageHeader} from '../pages/br.classes/constructionstage';
import {SubLocation, PlotStageProgress, PlotStageDetails} from '../pages/br.classes/sublocation';
import {SubLocationConStageNote, SubLocationConStageImage} from '../pages/br.classes/sublocationconstageattachments';
import{AppMeasureItem, AppMeasureItemNote, StageAppMeasureCount} from  '../pages/br.classes/appmeasureitem';
import{UserSettings, AppSettings} from  '../pages/br.classes/usersettings';
import {AppMeasureProgress, BudgetProgress, BudgetProgressNotes, AppmeasureProgressNotes} from './progressupdaterequest';
import {SiteProgressResults, BudgetProgressResult, AppMeasureProgressResult} from '../pages/br.classes/siteprogressresult';
import {SiteProgressResponse} from './progressupdateresponse'
import 'rxjs/add/operator/map';
 
@Injectable()
export class Database {
 
    private storage: SQLite;
    private isOpen: boolean = false;
    private appDBName: string = "housebuildingdata.db";

    public constructor(private platform: Platform) {
       platform.ready().then(() => {
            this.storage = new SQLite();
            this.storage.openDatabase({name: this.appDBName, location: "default"}).then(() => {               
                this.isOpen = true;
                console.log("database open");}                
                , (error) => { this.isOpen = false;
                   console.log("Unable to execute SQL" + error);
            });
       });            
    }
 
 public openOrCreateDatabase()  {  
     return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {         
       console.log("step1");     
            this.storage = new SQLite();
            /* , iosDatabaseLocation:"Library" use the following location for ios as default is not backup by iCould*/
            this.storage.openDatabase({name: this.appDBName, location: "default"}).then((data) => {
                  this.isOpen = true;
                  console.log("database open");
                     resolve(data);                           
            }, (error) => { 
                this.isOpen = false;
                console.log("Unable to execute SQL" + error);  
                reject(error);                            
            });        
        });
     });
 }

public createRegistrationTable() {
   return new Promise((resolve, reject) => {
    this.platform.ready().then(() => {  
 
            this.storage.executeSql(`CREATE TABLE IF NOT EXISTS registration (id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                                 activationcode INTEGER NOT NULL,
                                                                                 accesstoken TEXT NOT NULL, 
                                                                                 connected INTEGER DEFAULT 0,
                                                                                 customerno TEXT DEFAULT (''),
                                                                                 customername TEXT DEFAULT (''),
                                                                                 instancedescription TEXT DEFAULT (''),
                                                                                 relaychannel INTEGER DEFAULT 0,
                                                                                 userid INTEGER DEFAULT 0)`, []).then((data) => 
                {resolve(data);
            },
            (error) => {
                reject(error);
                });    
     });  
   });
}

public getTableColumns(){
      return new Promise((resolve, reject) => {
          this.platform.ready().then(() => {
                
            this.storage.executeSql("PRAGMA table_info(registration)", []).then((data) => {
                // var  activationData : RegistrationInfo;
                //   if(data.rows.length > 0) {           
                //          activationData = new RegistrationInfo(data.rows.item(0).activationcode, data.rows.item(0).connected, 
                //                                                data.rows.item(0).accesstoken)
            console.log(data);
             if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {
                        console.log(data.rows.item(i))
                    }
             }            
             resolve(data);  
                             
            }, (error) => {
                console.log(error);
                reject(error);
            });
          });
   
        });     
}
public alterRegistrationTableIfColsNotExist(){

return new Promise((resolve, reject) => {
          this.platform.ready().then(() => {
               let relayInfoExists : boolean = false;
               this.storage.executeSql("PRAGMA table_info(registration)", []).then((data) => {          
             if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {                      
                        if (data.rows.item(i).name === "relaychannel"){
                            relayInfoExists = true;                                                     
                        }
                    }
                    if (!relayInfoExists){
                        this.storage.executeSql(`ALTER TABLE registration ADD COLUMN customerno TEXT DEFAULT ('')`, []);
                         this.storage.executeSql(`ALTER TABLE registration ADD COLUMN customername TEXT DEFAULT ('')`, []);
                          this.storage.executeSql(`ALTER TABLE registration ADD COLUMN instancedescription TEXT DEFAULT ('')`, []);
                           this.storage.executeSql(`ALTER TABLE registration ADD COLUMN relaychannel INTEGER DEFAULT 0`, []);
                            this.storage.executeSql(`ALTER TABLE registration ADD COLUMN userid INTEGER DEFAULT 0`, []);                              
                                 resolve(data);                 
                    }
                    else{                        
                           resolve(data); 
                   }         
             }
                             
            }, (error) => {        
                console.log(error);       
                reject(error);
            });
          });   
        }); 
}

public getActivationInfo() {    
        return new Promise((resolve, reject) => {
          this.platform.ready().then(() => {
           this.alterRegistrationTableIfColsNotExist();
            this.storage.executeSql("SELECT * FROM registration", []).then((data) => {
                var  activationData : RegistrationInfo;
                  if(data.rows.length > 0) {           
                         activationData = new RegistrationInfo(data.rows.item(0).activationcode, data.rows.item(0).connected, 
                                                               data.rows.item(0).accesstoken, data.rows.item(0).customerno,
                                                                data.rows.item(0).customername,  data.rows.item(0).instancedescription,
                                                                 data.rows.item(0).relaychannel,  data.rows.item(0).userid);
                        //console.log(data.rows.item(0).activationcode);                 
                }
                resolve(activationData);
            }, (error) => {
                reject(error);
            });
          });
   
        });     
    }

    public saveActivationData(activationcode: string, accesstoken: string, connected: boolean, customerno: string,
                              custname: string, instance: string, relay:number, userid: number){
           this.createRegistrationTable();
           this.alterRegistrationTableIfColsNotExist();
        return new Promise((resolve, reject)=>{
              this.storage.executeSql("SELECT count(*) AS rowcount FROM registration WHERE accesstoken =?",[accesstoken]).then((data) =>
                            {
                             if (data.rows.item(0).rowcount && data.rows.item(0).rowcount > 0 ){
                                this.storage.executeSql(`UPDATE registration
                                                            SET customerno = ?,
                                                                customername = ?,
                                                                instancedescription = ?,
                                                                relaychannel = ?,
                                                                userid = ?
                                                            WHERE accesstoken = ?`, 
                                                                [customerno, custname, instance, relay, userid, accesstoken]).then((data) =>
                                                                {
                                                                                                
                                                                    resolve(data);
                                                                 }, (error) =>{
                                                                     reject(error);
                                                                });
                             }
                             else{
                               this.storage.executeSql(`INSERT INTO registration(activationcode, accesstoken, connected,
                                                              customerno, customername, instancedescription,
                                                              relaychannel, userid)
                                    VALUES(?,?,?, ?, ?, ?, ?, ?)`, [activationcode, accesstoken, connected, customerno,
                                                                    custname, instance, relay, userid]).then((data) =>{ 

                                        console.log("activation info inserted " + custname);
                                    resolve(data);
                                }, (error) => {
                                    reject(error);
                                    });
                                                    }
                            },
                        (error) =>{
                            reject(error);
        });

           
         });
    }

    public deleteActivationRecords(){
        return new Promise((resolve,reject)=>{
            this.storage.executeSql("DELETE FROM registration",[]).then((data)=> {
                resolve(data);
                }, (error)=>{
                    reject(error);
                });
         });
    }

public createSitesTable() {
   return new Promise((resolve, reject) => {
     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS sites (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                   primaryname TEXT,
                                                                   shortcode  TEXT,
                                                                   address TEXT,
                                                                   postcode TEXT,
                                                                   telephone TEXT,
                                                                   email TEXT,
                                                                   progressdate TEXT,
                                                                   syncdowndatetime TEXT,
                                                                   modified INTEGER,
                                                                   selected INTEGER DEFAULT 0)`, []).then((data) => 
        {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
}

public getDownloadedSites(){
     this.createSitesTable();
        return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT * FROM sites", []).then((data) => {
                let downloadedSites =  new Array<DownloadedSite>();
                if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {
                let savedSite = 
                    new DownloadedSite(data.rows.item(i).recordid,
                                        data.rows.item(i).primaryname,
                                        data.rows.item(i).shortcode,
                                        data.rows.item(i).address,
                                        data.rows.item(i).postcode,
                                        data.rows.item(i).telephone,
                                        data.rows.item(i).email,
                                        data.rows.item(i).progressdate,
                                        data.rows.item(i).syncdowndatetime,
                                        data.rows.item(i).modified,
                                        data.rows.item(i).selected)
                        downloadedSites.push(savedSite);
                    }
                }
                resolve(downloadedSites);
            }, (error) => {
                reject(error);
            });
        });
}

public getSelectedSites(){
        return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT * FROM sites WHERE selected = ?",[true]).then((data) => {
                let downloadedSites =  new Array<DownloadedSite>();
                if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {
                let savedSite = 
                    new DownloadedSite(data.rows.item(i).recordid,
                                        data.rows.item(i).primaryname,
                                        data.rows.item(i).shortcode,
                                        data.rows.item(i).address,
                                        data.rows.item(i).postcode,
                                        data.rows.item(i).telephone,
                                        data.rows.item(i).email,
                                        data.rows.item(i).progressdate,
                                        data.rows.item(i).syncdowndatetime,
                                        data.rows.item(i).modified,
                                        data.rows.item(i).selected)
                        downloadedSites.push(savedSite);
                    }
                }
                resolve(downloadedSites);
            }, (error) => {
                reject(error);
            });
        });
}

public getselectedSiteIds(){
    this.createSitesTable();
    return new Promise((resolve,reject)=> {
        this.storage.executeSql("SELECT recordid FROM sites WHERE selected = ?",[true]).then((data)=>{
            let siteIds = [];
            if(data.rows.length >0)
            {
                for(let i = 0; i < data.rows.length; i++) {
                    siteIds.push(data.rows.item(i).recordid);                    
                }
            }
            resolve(siteIds);
            }, (error) => {
                console.log(error.message);
                reject(error);
            });
        });
}
 
public saveSite(site: ISite, selected:boolean)
 {
    var d = new Date();
    var n = d.toISOString();
    this.createSitesTable();
    return  this.saveDownloadedSite(site.recordID,site.primaryName,site.shortCode,
                              site.address,site.postCode,site.telephone,site.email,
                              site.progressDate, n, false, selected);
}

public changeSiteStatus(recorId: number, selected:boolean)
{
    return new Promise((resolve, reject) => {
        this.storage.executeSql('UPDATE sites SET selected = ? WHERE recordid = ?',[selected, recorId]).then((data)=>{
                resolve(data);
            }, (error)=> {
                reject(error);
            });
    });
}

 public saveDownloadedSite(RecordID: number,
                             PrimaryName: string, ShortCode: string,  
                             Address: string, PostCode: string,  
                             Telephone: string, Email:string,  
                             ProgressDate: string, SyncDownDateTime: string, 
                             Modified: boolean, Selected: boolean) {
        return new Promise((resolve, reject) => {
            this.storage.executeSql(`INSERT OR REPLACE INTO sites (recordid, primaryname,
                                                                   shortcode,
                                                                   address,
                                                                   postcode,
                                                                   telephone,
                                                                   email,
                                                                   progressdate,
                                                                   syncdowndatetime,
                                                                   modified,
                                                                   selected) 
                                                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                                                                   , [RecordID, PrimaryName,ShortCode,
                                                                   Address  , PostCode, Telephone,
                                                                   Email, ProgressDate, SyncDownDateTime,
                                                                   Modified, Selected]).then((data) => {
                 console.log(RecordID + "-saved-" + Selected)                                                      
                resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public createSubLoctionTable(){    
 return new Promise((resolve, reject) => {     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS sublocation (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                         siteid INTEGER NOT NULL,
                                                                         primaryname TEXT, 
                                                                         shortcode TEXT,
                                                                         housetypename TEXT,
                                                                         housetypealtname TEXT,
                                                                         locationorder INTEGER DEFAULT 0,
                                                                         FOREIGN KEY (siteid) REFERENCES sites(recordid))`, []).then((data) => 
        {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
 }

public alterSublocationTableIfColsNotExist(){

return new Promise((resolve, reject) => {
          this.platform.ready().then(() => {
               let locOrder : boolean = false;
               this.storage.executeSql("PRAGMA table_info(sublocation)", []).then((data) => {          
             if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {                      
                        if (data.rows.item(i).name === "locationorder"){
                            locOrder = true;                                                     
                        }
                    }
                    if (!locOrder){                       
                           this.storage.executeSql(`ALTER TABLE sublocation ADD COLUMN locationorder INTEGER DEFAULT 0`, []);                                                 
                              resolve(data);                 
                    }
                    else{                        
                           resolve(data); 
                   }         
             }
                             
            }, (error) => {        
                console.log(error);       
                reject(error);
            });
          });   
        }); 
}

public dropSubLoctionTable(){ 
     return new Promise((resolve, reject) => {     
        this.storage.executeSql("DROP TABLE sublocation", []).then((data) => 
        {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
}

public deleteAllPlots(){
    return new Promise((resolve, reject) =>{
            this.storage.executeSql(`DELETE FROM sublocation`,[]).then((data) =>
            {resolve(data);           
            },
            (error) => {
                reject(error);
            });
    });
}

public getAllPlots(){
 return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT * FROM sublocation ORDER BY locationorder", []).then((data) => {       
             let sublocations =  new Array<SubLocation>();
                if(data.rows.length > 0) {
                 for(let i = 0; i < data.rows.length; i++) {
                  let sublocation = 
                    new SubLocation(data.rows.item(i).recordid,
                                    data.rows.item(i).siteid,
                                    data.rows.item(i).primaryname,
                                    data.rows.item(i).shortcode,
                                    data.rows.item(i).housetypename,
                                    data.rows.item(i).housetypealtanme,
                                    data.rows.item(i).locationorder)
                        sublocations.push(sublocation);
                    }
                }
                resolve(sublocations);
            }, (error) => {
                reject(error);
            });
        });
  }

public getPlots(SiteID: number){
    this.createSubLoctionTable();
      return new Promise((resolve, reject) => {         
            this.storage.executeSql("SELECT * FROM sublocation WHERE siteid = ?  ORDER BY locationorder", [SiteID]).then((data) => {
                let sublocations =  new Array<SubLocation>();
                if(data.rows.length > 0) {
                 for(let i = 0; i < data.rows.length; i++) {
                  let sublocation = 
                    new SubLocation(data.rows.item(i).recordid,
                                    data.rows.item(i).siteid,
                                    data.rows.item(i).primaryname,
                                    data.rows.item(i).shortcode,
                                    data.rows.item(i).housetypename,
                                    data.rows.item(i).housetypealtanme,
                                    data.rows.item(i).locationorder)
                        sublocations.push(sublocation);
                       
                    }
                }                
                resolve(sublocations);
            }, (error) => {
                reject(error);
            });
        });
}

public savePlot(RecordID: number, SiteID: number,
                PrimaryName: string, ShortCode: string,
                HouseTypeName: string, HouseTypeAltName: string,
                locOrder: number) {
        return new Promise((resolve, reject) => {
            this.createSubLoctionTable();
            this.storage.executeSql(`INSERT OR REPLACE INTO sublocation (recordid, siteid,
                                                                   primaryname,
                                                                   shortcode,
                                                                   housetypename,
                                                                   housetypealtname,
                                                                   locationorder) 
                                                                   VALUES (?, ?, ?, ?,?,?, ?)`
                                                                   , [RecordID, SiteID,PrimaryName,ShortCode, HouseTypeName, HouseTypeAltName, locOrder]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public saveAllPlots(plotList: any, siteID: number){
  return new Promise((resolve, reject) => {
      let sqlBatch: any = new Array();
         for (let pl of plotList)
              {             
                 let tran: any;
                 tran = ["INSERT OR REPLACE INTO sublocation (recordid, siteid, primaryname, shortcode, housetypename, housetypealtname, locationorder) VALUES (?, ?, ?, ?,?,?, ?)" ,
                                [pl.recordID, siteID, pl.primaryName, pl.shortCode, pl.houseTypeName, pl.houseTypeAltName, pl.locationOrder]];
                                
                     sqlBatch.push(tran);  
          }
            this.storage.sqlBatch(sqlBatch).then((data) => {
                            resolve (data);
            }, (error) =>{
                    reject(error);
            });                         
  });
}

public createConstructionStageHeaderTable(){
 return new Promise((resolve, reject) => {
     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS constageheader (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                            constageheaderid INTEGER NOT NULL,
                                                                            siteid INTEGER NOT NULL,
                                                                            description TEXT, 
                                                                            buildorder INTEGER,
                                                                            FOREIGN KEY (siteid) REFERENCES sites(recordid))`, []).then((data) => 
        {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
 }


public getConstructionStageHeaders(siteId: number){
    this.createConstructionStageHeaderTable();
        return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT * FROM constageheader  WHERE siteid = ? ORDER BY buildorder ASC", [siteId]).then((data) => {
                let stageHeaders =  new Array<ConstructionStageHeader>();
                if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {
                let header = 
                    new ConstructionStageHeader(data.rows.item(i).recordid,
                                                data.rows.item(i).siteid,
                                                data.rows.item(i).constageheaderid,
                                                data.rows.item(i).description,
                                                data.rows.item(i).buildorder)
                        stageHeaders.push(header);
                    }
                }
                resolve(stageHeaders);
            }, (error) => {
                reject(error);
            });
        });
}

 public saveConstructionStageHeader(StageHeaderID: number, SiteID: number,
                Description: string, BuildOrder: number) {
        return new Promise((resolve, reject) => {
            this.createConstructionStageHeaderTable();
            this.storage.executeSql(`INSERT INTO constageheader (siteid,
                                                                 constageheaderid,         
                                                                  description,
                                                                  buildorder) 
                                                                            VALUES (?, ?, ?, ?)`, 
                                                                          [SiteID, StageHeaderID, Description, BuildOrder]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }


public createConstructionStageTable(){
 return new Promise((resolve, reject) => {
     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS constage (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                      constageid INTEGER NOT NULL,
                                                                      constageheaderid INTEGER NOT NULL,
                                                                      siteid   INTEGER NOT NULL,                                                                   
                                                                      description TEXT, 
                                                                      buildorder INTEGER)`, []).then((data) => 
        {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
 }


public dropConstructionStageHeaderTable(){
    return new Promise((resolve, reject) =>{
            this.storage.executeSql(`DROP TABLE constageheader`,[]).then((data) =>
            {resolve(data);            
            },
            (error) => {
                reject(error);
            });
    });
}

public dropConstructionStageTable(){
    return new Promise((resolve, reject) =>{
            this.storage.executeSql(`DROP TABLE constage`,[]).then((data) =>
            {resolve(data);
             },
            (error) => {
                reject(error);
            });
    });
}

public getConstructionStages(constructionStageHeaderID: number){
    this.createConstructionStageTable();
        return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT * FROM constage  WHERE constageheaderid = ? ORDER BY buildorder ASC", [constructionStageHeaderID]).then((data) => {
                let stages =  new Array<ConstructionStage>();
                if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {
                let stage = 
                    new ConstructionStage(data.rows.item(i).recordid,
                                                data.rows.item(i).constageid,
                                                data.rows.item(i).constageheaderid,
                                                 data.rows.item(i).siteid,
                                                data.rows.item(i).description,
                                                data.rows.item(i).buildorder)
                        stages.push(stage);
                    }
                }
                resolve(stages);
            }, (error) => {
                reject(error);
            });
        });
}

public getSiteConstructionStages(siteID: number){
        return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT constage.* FROM constage
                                        WHERE siteid = ? ORDER BY constage.buildorder ASC`, [siteID]).then((data) => {
                let stages =  new Array<ConstructionStage>();
                if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {
                let stage = 
                    new ConstructionStage(data.rows.item(i).recordid,
                                                data.rows.item(i).constageid,
                                                data.rows.item(i).constageheaderid,
                                                data.rows.item(i).siteid,
                                                data.rows.item(i).description,
                                                data.rows.item(i).buildorder)
                        stages.push(stage);
                    }
                }
                resolve(stages);
            }, (error) => {
                reject(error);
            });
        });
}


 public saveConstructionStage(ConStageID: number, ConstageHeaderID: number,
                              SiteID: number, Description: string, BuildOrder: number) {
        return new Promise((resolve, reject) => {
            this.createConstructionStageTable();
            this.storage.executeSql(`INSERT OR REPLACE INTO constage (constageid, 
                                                                      constageheaderid,
                                                                      siteid,
                                                                      description,
                                                                      buildorder) 
                                                                      VALUES (?, ?, ?, ?, ?)`, 
                                                                      [ConStageID, ConstageHeaderID, SiteID, Description, BuildOrder]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public saveAllHeadersAndStages(headers: any, stages: any, siteID: number){
  return new Promise((resolve, reject) => {
      let sqlBatch: any = new Array();
       for (let header of headers)
        {                
          let tran: any;
          tran = [`INSERT INTO constageheader (siteid, constageheaderid, description, buildorder) VALUES (?, ?, ?, ?)`, 
                                                                          [siteID, header.recordID, header.name, header.buildOrder]];             
                     sqlBatch.push(tran);  
          }
        for (let stage of stages)
        {
            let stageTran: any;                 
             stageTran = [`INSERT OR REPLACE INTO constage (constageid, constageheaderid, siteid, description, buildorder) VALUES (?, ?, ?, ?, ?)`, 
                                                [stage.constructionStageID, stage.constructionHeaderID, siteID, stage.description, stage.buildOrder]];             
             sqlBatch.push(stageTran);  
        } 
          this.storage.sqlBatch(sqlBatch).then((data) => {
                            resolve (data);
            }, (error) =>{
                    reject(error);
           });                         
  });
}

public createSubLocationConstructionStageTable(){
 return new Promise((resolve, reject) => {
     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS sublocationconstage (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                                 sublocationid INTEGER NOT NULL,
                                                                                 constageid INTEGER NOT NULL,                                                                                 
                                                                                 currentworkprogress INTEGER,
                                                                                 newworkprogress INTEGER,
                                                                                 progressdate TEXT,
                                                                                 FOREIGN KEY (sublocationid) REFERENCES sublocation(recordid))`, []).then((data) => 
        {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
 }

public dropProgressTable(){
    return new Promise((resolve, reject) =>{
            this.storage.executeSql(`DROP TABLE sublocationconstage`,[]).then((data) =>
            {resolve(data);           
            },
            (error) => {
                reject(error);
            });
    });
    
}

 public insertPlotConstructionStage(SubLocationID: number, ConStageID: number, 
                                    CurrentWorkProgress: number) {
        this.createSubLocationConstructionStageTable();
        return new Promise((resolve, reject) => {
          //  this.storage.sqlBatch()
            this.storage.executeSql(`INSERT INTO sublocationconstage (sublocationid,
                                                                      constageid,                                                                               
                                                                      currentworkprogress,
                                                                      newworkprogress,
                                                                      progressdate) 
                                                                      VALUES (?, ?, ?, ?, ?)`, 
                                                                      [SubLocationID, ConStageID, 
                                                                       CurrentWorkProgress ,null, null]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public InsertAllPlotStageProgressAndAppMeasureItems(plotProgress: any, appProgress:any)
{
 return new Promise((resolve, reject) => {
      let sqlBatch: any = new Array();
       if (plotProgress && plotProgress.length > 0){
        for (let progress of plotProgress)
         { if (progress){
                 let tran: any;
                 tran = [`INSERT INTO sublocationconstage (sublocationid, constageid, currentworkprogress, newworkprogress, progressdate) VALUES (?, ?, ?, ?, ?)`, 
                                [progress.plotID, progress.constructionStageID, progress.currentWorkProgress ,null, null]];             
                 sqlBatch.push(tran);
            }             
          }
       }   
      if (appProgress && appProgress.length > 0){
            for (let app of appProgress)
               {
                 if(app){
                     let appTran: any;                          
                      appTran = [`INSERT OR REPLACE INTO appmeasureitems (recordid, sublocationid, constageid, description, unit, currentmosqty, newmosqty, requiredqty,                                                                                                                    
                                                                          currentprogressqty, newprogressqty, progressdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                   [app.recordID, app.subLocationID, app.constructionStageID, app.description , app.units, app.MOSQty , null, app.reqQty, app.prgQty, null, null]];             
                      sqlBatch.push(appTran); 
                   }                     
                } 
        }      
       this.storage.sqlBatch(sqlBatch).then((data) => {
                            resolve (data);
            }, (error) =>{
                    reject(error);
           });                         
  });
}

public getPlotProgress(SubLocationID: number) {
       return new Promise((resolve, reject) => {
        this.storage.executeSql(`SELECT  recordid, constageid, sublocationid,currentworkprogress, 
                                         newworkprogress, progressdate
                                  FROM   sublocationconstage                                 
                                  WHERE  sublocationid = ?`,[SubLocationID]).then((data) => {
                                          let progress =  new Array<PlotStageProgress>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                let stageProgress = 
                                                new PlotStageProgress(data.rows.item(i).recordid,
                                                                    data.rows.item(i).sublocationid,
                                                                    data.rows.item(i).constageid,                                                                  
                                                                    data.rows.item(i).currentworkprogress,
                                                                    data.rows.item(i).newworkprogress,
                                                                    data.rows.item(i).progressdate)
                                                    progress.push(stageProgress); 
                                                }
                                            }
                                            resolve(progress);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
                                });
}

public getPlotStageProgress(SubLocationID: number, StageID: number) {
       return new Promise((resolve, reject) => {
        this.storage.executeSql(`SELECT  recordid, constageid, sublocationid,currentworkprogress, 
                                         newworkprogress, progressdate
                                  FROM   sublocationconstage                                 
                                  WHERE  sublocationid = ? and constageid = ?
                                  LIMIT  1`,[SubLocationID, StageID]).then((data) => {
                                        let stageProgress : PlotStageProgress;
                                            if(data.rows.length > 0) {
                                              console.log(data.rows.length);    
                                               stageProgress = new PlotStageProgress(data.rows.item(0).recordid,
                                                                    data.rows.item(0).sublocationid,
                                                                    data.rows.item(0).constageid,                                                                  
                                                                    data.rows.item(0).currentworkprogress,
                                                                    data.rows.item(0).newworkprogress,
                                                                    data.rows.item(0).progressdate)                                                  
                                                }
                                            resolve(stageProgress);
                                        },
                                            (error) => {
                                                 console.log(error);  
                                                reject(error);
                                            });
                                });
}

public getPlotProgressForSite(siteID: number) {
       return new Promise((resolve, reject) => {
        this.storage.executeSql(`SELECT  sublocationconstage.*
                                     FROM   sublocationconstage    
                                     INNER JOIN sublocation ON sublocation.recordid = sublocationconstage.sublocationid                        
                                     WHERE  sublocation.siteid = ?`,[siteID]).then((data) => {
                                          let progress =  new Array<PlotStageProgress>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                let stageProgress = 
                                                new PlotStageProgress(data.rows.item(i).recordid,
                                                                    data.rows.item(i).sublocationid,
                                                                    data.rows.item(i).constageid,                                                                  
                                                                    data.rows.item(i).currentworkprogress,
                                                                    data.rows.item(i).newworkprogress,
                                                                    data.rows.item(i).progressdate)
                                                    progress.push(stageProgress); 
                                                }
                                            }
                                            resolve(progress);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
                                });
}


public updatePlotConstructionStage(SubLocationID: number, ConStageID: number,WorkProgress: number, progressDate: string){
    return new Promise((resolve, reject) => {
                this.storage.executeSql(`UPDATE sublocationconstage
                                          SET newworkprogress = ?,
                                              progressdate = ?
                                          WHERE sublocationid = ? 
                                          AND constageid = ?`,[WorkProgress, progressDate,
                                            SubLocationID, ConStageID]).then((data) => {
                                            resolve(data);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
                                });
}

 public createSubLocationConstructionStageAttachmentTable(){
 return new Promise((resolve, reject) => {     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS attachments (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                         sublocationid INTEGER NOT NULL,
                                                                         constageid INTEGER NOT NULL,
                                                                         picturedata TEXT NOT NULL,  
                                                                         picturetaken TEXT)`, []).then((data) => 
        {resolve(data);
       },
       (error) => {
           console.log(error);
           reject(error);
           });
   });
 }

public dropAttachmentsTableIfOldColumnsExist(){
    return new Promise((resolve, reject) =>{
         let sublocidExists : boolean = false;
         let loationColExists: boolean = false;
                           this.storage.executeSql("PRAGMA table_info(attachments)", []).then((data) => {          
             if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {                      
                        if (data.rows.item(i).name === "sublocationid"){

                            sublocidExists = true;                                                     
                        }
                         if (data.rows.item(i).name === "picturelocation"){                            
                            loationColExists = true;                                                     
                        }
                    }
                    if (!sublocidExists){                                                
                       this.storage.executeSql(`DROP TABLE IF EXISTS attachments`,[]).then((data) =>
                            {
                                this.createSubLocationConstructionStageAttachmentTable();
                                resolve(data);           
                            },
                            (error) => {
                                console.log(error);
                                reject(error);
                            });                
                    }
                    else{                        
                           resolve(data); 
                   }
                    if (loationColExists){                                                
                       this.storage.executeSql(`DROP TABLE IF EXISTS attachments`,[]).then((data) =>
                            {
                                this.createSubLocationConstructionStageAttachmentTable();
                                resolve(data);           
                            },
                            (error) => {
                                console.log(error);
                                reject(error);
                            });                
                    }
                    else{                        
                           resolve(data); 
                   }         

             }                             
            }, (error) => {        
                console.log(error);       
                reject(error);
            });           
    });
}

public findPlotProgressAttachment(sublocationID: number, constageid: Number, picturelocation:string){
   return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT * FROM attachments
                                        WHERE sublocationid = ?
                                        AND constageid = ?
                                        AND picturelocation = ?`, 
                                        [sublocationID, constageid,picturelocation]).then((data) => 
                                       {
                                        let image : SubLocationConStageImage;
                                        if(data.rows.length > 0) {                                               
                                            image = 
                                                new SubLocationConStageImage(data.rows.item(0).recordid,
                                                                    data.rows.item(0).sublocationid,
                                                                    data.rows.item(0).constageid,
                                                                    data.rows.item(0).picturedata,                                                                  
                                                                    data.rows.item(0).picturetaken)                                              
                                                
                                    }
                resolve(image);
            }, 
                (error) => {
                reject(error);
            });
        }); 
}

public getImageByRecordID(recordID: number){
    return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT picturedata FROM attachments
                                        WHERE recordid = ?`, 
                                        [recordID]).then((data) => 
                                       {
                                        let image : string;
                                        if(data.rows.length > 0) {                                               
                                            image =  data.rows.item(0).picturedata;                                                                                         
                                    }
                resolve(image);
            }, 
                (error) => {
                reject(error);
            });
        }); 
}

public getSiteProgressImages(siteID: number){
 return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT attachments.recordid, attachments.sublocationid , 
                                    attachments.constageid, attachments.picturetaken
                                      FROM attachments 
                                      INNER JOIN sublocation ON sublocation.recordid = attachments.sublocationid                        
                                      WHERE  sublocation.siteid = ?
                                      ORDER BY sublocationid, constageid`, 
                                        [siteID]).then((data) => 
                     {let images =  new Array<SubLocationConStageImage>();
                                            if(data.rows.length > 0) {
                                                try{
                                                      for(let i = 0; i < data.rows.length; i++) {
                                                        let image = 
                                                        new SubLocationConStageImage(data.rows.item(i).recordid,
                                                                                    data.rows.item(i).sublocationid,
                                                                                    data.rows.item(i).constageid,
                                                                                    null,                                                                  
                                                                                    data.rows.item(i).picturetaken)
                                                            images.push(image); 
                                                        }
                                                        }
                                                catch(e){
                                                            console.log(e);
                                                }                                          
                                            }
                resolve(images);
            }, 
                (error) => {
                    console.log(error);
                reject(error);
            });
        }); 
}

public getSublocationConStageAttachments(sublocationID: number, constageID: number){
   return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT * FROM attachments
                                        WHERE sublocationid = ?
                                        AND constageid = ? 
                                      ORDER BY constageid`, 
                                        [sublocationID, constageID]).then((data) => 
                     {let images =  new Array<SubLocationConStageImage>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                let image = 
                                                new SubLocationConStageImage(data.rows.item(i).recordid,
                                                                                data.rows.item(i).sublocationid,
                                                                                data.rows.item(0).constageid,
                                                                                data.rows.item(i).picturedata,                                                                  
                                                                                data.rows.item(i).picturetaken)
                                                    images.push(image); 
                                                }
                                            }
                resolve(images);
            }, 
                (error) => {
                reject(error);
            });
        }); 
}


public savePlotConstructionStageAttachments(SublocationID: number, ConStageId: number,
                                             Photo : string, photodatetime: string) {
        this.createSubLocationConstructionStageAttachmentTable();
        return new Promise((resolve, reject) => {
            this.storage.executeSql(`INSERT INTO attachments (sublocationid,
                                                               constageid,
                                                               picturedata,
                                                               picturetaken) 
                                                               VALUES (?, ?, ?, ?)`, 
                                                               [SublocationID, ConStageId, Photo, photodatetime]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public deletePlotConstructionStageAttachment(recordID: number){
    return new Promise((resolve, reject) => {
            this.storage.executeSql(`DELETE FROM attachments 
                                     WHERE recordid = ?`,[recordID]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
}

public createSubLocationConstructionStageNotesTable(){
 return new Promise((resolve, reject) => {
     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS notes (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                   sublocationconstageid INTEGER NOT NULL,
                                                                   notes TEXT,
                                                                   notedatetime TEXT,                                                                        
                                                                   FOREIGN KEY (sublocationconstageid) REFERENCES sublocationconstage(recordid))`, []).then((data) => 
        {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
 }

 public addPlotConstructionStageNotes(SublocationConStageID: number,
                                       Notes : string,
                                       NotesDateTime: string) {

        this.createSubLocationConstructionStageNotesTable();
        return new Promise((resolve, reject) => {
            this.storage.executeSql(`INSERT INTO notes (sublocationconstageid,
                                                        notes,
                                                        notedatetime) 
                                                        VALUES (?, ?, ?)`, 
                                                       [SublocationConStageID, Notes, NotesDateTime]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public editPlotConstructionStageNotes(recordID: number, note: string){
    return new Promise((resolve, reject) => {
         var d = new Date();
            this.storage.executeSql(`UPDATE notes SET   notes = ?,
                                                        notedatetime = ? 
                                                        WHERE recordid = ?`, 
                                                       [note, d.toISOString(), recordID]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
}

public deletePlotConstructionStageNotes(recordID: number) {
       return new Promise((resolve, reject) => {
            this.storage.executeSql(`DELETE FROM notes 
                                     WHERE recordid = ?`, 
                                    [recordID]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public getPlotConStageNotes(SublocationConStageID: number){
 this.createSubLocationConstructionStageNotesTable();
        return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT * FROM notes
                                        WHERE sublocationconstageid = ?`, 
                                        [SublocationConStageID]).then((data) => 
            {let notes =  new Array<SubLocationConStageNote>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                let stageNote = 
                                                new SubLocationConStageNote(data.rows.item(i).recordid,
                                                                    data.rows.item(i).sublocationconstageid,
                                                                    data.rows.item(i).notes,                                                                  
                                                                    data.rows.item(i).notedatetime)
                                                    notes.push(stageNote); 
                                                }
                                            }
                resolve(notes);
            }, 
                (error) => {
                reject(error);
            });
        }); 
}

public resetPlotProgressForSite(SiteID: number){
    return new Promise((resolve, reject) => {
             this.storage.executeSql(`UPDATE sublocationconstage
                                          SET newworkprogress = ?,
                                              progressdate = ?
                                          WHERE sublocationid IN 
                                              (SELECT recordid 
                                               FROM  sublocation 
                                               WHERE sublocation.siteid = ?)`,[null, null,SiteID]).then((data) => {
                                            resolve(data);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
    });
}

public resetPlotProgressForSubLocation(subLocationID: number){
    return new Promise((resolve, reject) => {
             this.storage.executeSql(`UPDATE sublocationconstage
                                          SET newworkprogress = ?,
                                              progressdate = ?
                                          WHERE sublocationid =? `
                                             ,[null, null,subLocationID]).then((data) => {
                                            resolve(data);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
    });
}


public createAppMeasureItemsTable(){
 return new Promise((resolve, reject) => {     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS appmeasureitems (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                                 sublocationid INTEGER NOT NULL,
                                                                                 constageid INTEGER NOT NULL,                                                                           
                                                                                 description TEXT NOT NULL,
                                                                                 unit TEXT NOT NULL,
                                                                                 currentmosqty INTEGER,
                                                                                 newmosqty INTEGER,
                                                                                 requiredqty INTEGER,
                                                                                 currentprogressqty INTEGER,
                                                                                 newprogressqty INTEGER,
                                                                                 progressdate TEXT,
                                                                                 FOREIGN KEY (sublocationid) REFERENCES sublocation(recordid))`, []).then((data) => 
        {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
 }

public dropAppItems(){
    return new Promise((resolve, reject) =>{
            this.storage.executeSql(`DROP TABLE appmeasureitems`,[]).then((data) =>
            {resolve(data);           
            },
            (error) => {
                reject(error);
            });
    });
}

 public insertAppmeasureItem(RecordID: number, SubLocationID: number, ConStageID: number,Description: string,
                             Unit: string, MOSQty: number, ReqQty: number, CurrentProgress: number) {
        this.createAppMeasureItemsTable();
        return new Promise((resolve, reject) => {
            
            this.storage.executeSql(`INSERT OR REPLACE INTO appmeasureitems (recordid,
                                                                      sublocationid,
                                                                      constageid,  
                                                                      description,
                                                                      unit,
                                                                      currentmosqty,
                                                                      newmosqty,
                                                                      requiredqty,                                                                                                                    
                                                                      currentprogressqty,
                                                                      newprogressqty,
                                                                      progressdate) 
                                                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                                                      [RecordID, SubLocationID, ConStageID, Description,
                                                                      Unit, MOSQty , null, ReqQty,CurrentProgress,
                                                                      null, null]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public updateAppmeasureItemValues(RecordID: number, NewMOSQty: number, 
                                    NewProgressQty: number, ProgressDate: string){
     return new Promise((resolve, reject) => {
                this.storage.executeSql(`UPDATE appmeasureitems
                                          SET    newmosqty = ?,                                       
                                                 newprogressqty = ?,
                                                 progressdate = ?
                                          WHERE  recordid =? `
                                             , [NewMOSQty, NewProgressQty, ProgressDate,
                                                RecordID]).then((data) => {
                                            resolve(data);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
    });
 }

public resetAppmeasureItemsForPlot(sublocationID: number){
return new Promise((resolve, reject) => {          
    this.storage.executeSql(`DELETE FROM appmeasurenotes
                                    WHERE recordid IN
                                        (SELECT appmeasurenotes.recordid FROM appmeasurenotes
                                        INNER JOIN appmeasureitems 
                                                ON appmeasureitems.recordid = appmeasurenotes.appmeasureitemid
                                            WHERE appmeasureitems.sublocationid = ?)`
                                                , [sublocationID]).then(() =>{
                    
                this.storage.executeSql(`UPDATE appmeasureitems
                                          SET newmosqty = ?,
                                            newprogressqty = ?,
                                            progressdate = ?
                                         WHERE sublocationid = ? `,
                                             [null, null, null, sublocationID]).then((data) =>{
                                                resolve (data);
                                            },
                                             (error) =>{
                                                 console.log(error);
                                                reject(error);
                                             });
                                    },
                                (error) =>{
                                     console.log(error);
                                    reject(error);
                                });
     });                         
}

public resetAppmeasureItemsForSite(siteID: number){
  return new Promise((resolve, reject) => {          
      this.storage.executeSql(`DELETE FROM appmeasurenotes
                                    WHERE appmeasurenotes.appmeasureitemid IN
                                    (SELECT appmeasureitems.recordid 
                                       FROM  appmeasureitems
                                       INNER JOIN  sublocation 
                                          ON sublocation.recordid = appmeasureitems.sublocationid
                                       WHERE sublocation.siteid = ?)`, [siteID]).then(() =>{

      this.storage.executeSql(`UPDATE appmeasureitems
                                          SET newmosqty = ?,
                                            newprogressqty = ?,
                                            progressdate = ?
                                         WHERE appmeasureitems.sublocationid IN
                                    (SELECT recordid 
                                      FROM  sublocation 
                                     WHERE sublocation.siteid = ?)`, [null, null, null, siteID]).then((data) =>{
                                            resolve (data);
                                            },
                                             (error) =>{
                                                 console.log(error);
                                                reject(error);
                                             });
                                    },
                                (error) =>{
                                    console.log(error);
                                    reject(error);
                                });
     });
}

public resetAppmeasureItemValuesForPlotAndStage(sublocationID: number, stageID: number){
  return new Promise((resolve, reject) => { 

             this.storage.executeSql(`UPDATE appmeasureitems
                                          SET newmosqty = ?,
                                            newprogressqty = ?,
                                            progressdate = ?
                                         WHERE sublocationid = ? AND
                                            constageid = ?`, [null, null, null, sublocationID, stageID]).then((data) =>{
                                               resolve (data);
                                            },
                                             (error) =>{
                                                reject(error);
                                             });   
     });                      
}

public deleteAppMeasureNotesForPlotAndStage(sublocationID: number, stageID: number){
    return new Promise((resolve, reject) => { 
        this.storage.executeSql(`DELETE FROM appmeasurenotes
                                    WHERE recordid IN
                                        (SELECT appmeasurenotes.recordid FROM appmeasurenotes
                                        INNER JOIN appmeasureitems 
                                                ON appmeasureitems.recordid = appmeasurenotes.appmeasureitemid
                                            WHERE appmeasureitems.sublocationid = ?
                                                AND appmeasureitems.constageid = ?)`, [sublocationID, stageID]).then((data) =>{                                                  
                                              resolve (data);         
                                    },
                                (error) =>{                                   
                                    reject(error);
                                });
     }); 
}

public getAppMeasureItems(SubLocationID: number, StageID: number) {
    this.createAppMeasureItemsTable();
       return new Promise((resolve, reject) => {
        this.storage.executeSql(`SELECT  *
                                  FROM   appmeasureitems                                 
                                  WHERE  sublocationid = ?
                                    AND  constageid = ?`,[SubLocationID, StageID]).then((data) => {
                                          let appItems =  new Array<AppMeasureItem>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                let appItem = 
                                                new AppMeasureItem(data.rows.item(i).recordid,
                                                                    data.rows.item(i).sublocationid,
                                                                    data.rows.item(i).constageid,  
                                                                    data.rows.item(i).description,
                                                                    data.rows.item(i).unit,
                                                                    data.rows.item(i).requiredqty,
                                                                    data.rows.item(i).currentmosqty,  
                                                                    data.rows.item(i).newmosqty,                                                                 
                                                                    data.rows.item(i).currentprogressqty,
                                                                    data.rows.item(i).newprogressqty,
                                                                    data.rows.item(i).progressdate)
                                                    appItems.push(appItem); 
                                                }
                                            }
                                            resolve(appItems);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
                                });
}

public getAppMeasureItemsCountForPlot(SubLocationID: number){
    this.createAppMeasureItemsTable();
    return new Promise((resolve, reject) =>{
    this.storage.executeSql(`SELECT constageid, COUNT(recordid) AS itemCount
                              FROM appmeasureitems
                             WHERE sublocationid =?
                             GROUP BY  constageid`,[SubLocationID]).then((data) =>                            
                            { 
                              let appItems = new Array<StageAppMeasureCount>();
                                  if(data.rows.length > 0) {
                                    for(let i = 0; i < data.rows.length; i++) {
                                            appItems.push(new StageAppMeasureCount(data.rows.item(i).constageid, 
                                                              data.rows.item(i).itemCount));                                        
                                    }
                                  }
                                  resolve(appItems);
                             }, 
                              (error) => {
                                        reject(error);
                                });
    }); 
}

public createAppMeasureNotesTable(){
 return new Promise((resolve, reject) => {     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS appmeasurenotes (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                            appmeasureitemid INTEGER NOT NULL,
                                                                            notes TEXT,
                                                                            notedatetime TEXT,                                                                        
                                                                            FOREIGN KEY (appmeasureitemid) REFERENCES appmeasureitems(recordid))`,
                                                                            []).then((data) => 
                    {resolve(data);
       },
       (error) => {
           reject(error);
           });
   });
}

public addAppMeasureNote(AppmeasureItemID: number,
                                       Notes : string,
                                       NotesDateTime: string) {

        this.createAppMeasureNotesTable();
        return new Promise((resolve, reject) => {
            this.storage.executeSql(`INSERT INTO appmeasurenotes (appmeasureitemid,
                                                                    notes,
                                                                    notedatetime) 
                                                                    VALUES (?, ?, ?)`, 
                                                       [AppmeasureItemID, Notes, NotesDateTime]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }


public editAppMeasureNote(recordId: number , note: string){
      return new Promise((resolve, reject) => {
          let d = new Date();
            this.storage.executeSql(`UPDATE appmeasurenotes 
                                       SET  notes = ?, notedatetime = ? 
                                       WHERE  recordid = ?`, 
                                [note, d.toISOString(), recordId]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });

  }

public deleteAppMeasureItemNotes(recordID: number) {
       return new Promise((resolve, reject) => {
            this.storage.executeSql(`DELETE FROM appmeasurenotes 
                                     WHERE recordid = ?`, 
                                    [recordID]).then((data) => 
            { resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

public getAppMeasureNotes(AppmeasureItemID: number){
 this.createAppMeasureItemsTable();
        return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT * FROM appmeasurenotes
                                        WHERE appmeasureitemid = ?`, 
                                        [AppmeasureItemID]).then((data) => 
            {let notes =  new Array<AppMeasureItemNote>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                let appNote = 
                                                new AppMeasureItemNote(data.rows.item(i).recordid,
                                                                    data.rows.item(i).appmeasureitemid,
                                                                    data.rows.item(i).notes,                                                                  
                                                                    data.rows.item(i).notedatetime)
                                                    notes.push(appNote); 
                                                }
                                            }
                resolve(notes);
            }, 
                (error) => {
                reject(error);
            });
        }); 
}

public createTableUserSettings(){
   return new Promise((resolve, reject) => {     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS usersettings (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                            appmeasureitemsonly INTEGER DEFAULT 0,
                                                                            nocompletedstages INTEGER DEFAULT 0)`,
                                                                            []).then((data) => 
                    {resolve(data);
       },
       (error) => {
           console.log(error);
           reject(error);
           });
   });
}

public getUserSettings(){
    this.createTableUserSettings();
      return new Promise((resolve, reject) => { 
            this.storage.executeSql('SELECT * FROM usersettings',[]).then((data) =>{               
                if (data && data.rows.length >0){                        
                    let setting = new UserSettings(data.rows.item(0).appmeasureitemsonly, data.rows.item(0).nocompletedstages);
                    resolve(setting);
                }else{
                    resolve(new UserSettings(false, false));
                }
            }, (error) => {
                console.log(error);
                reject(error);
            });
      });                                 
}

public saveUserSettings(showAppmeasureItemsOnly: Boolean, hideCompletedStages: Boolean){
  this.createTableUserSettings();
  return new Promise((resolve, reject) => { 
  this.storage.executeSql("SELECT count(*) AS rowcount FROM usersettings",[]).then((data) =>
                            {
                             if (data.rows.item(0).rowcount && data.rows.item(0).rowcount > 0 ){
                                this.storage.executeSql(`UPDATE usersettings
                                                            SET appmeasureitemsonly = ?,
                                                                nocompletedstages = ? `, 
                                                                [showAppmeasureItemsOnly, hideCompletedStages]).then((data) =>
                                                                {
                                                                    resolve(data);
                                                                 }, (error) =>{
                                                                     reject(error);
                                                                });
                             }
                             else{
                                this.storage.executeSql(`INSERT INTO usersettings 
                                                                (appmeasureitemsonly, nocompletedstages)
                                                                VALUES (?,?)`,
                                                                [showAppmeasureItemsOnly, hideCompletedStages]).then((data) =>
                                                                {
                                                                    resolve(data);
                                                                }, 
                                                                (error) => {
                                                                    reject(error);
                                                                });
                             }
                            },
                        (error) =>{
                            reject(error);
        });
    });
  }

public createTableAppSettings(){
   return new Promise((resolve, reject) => {     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS appsettings (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                            imagequality INTEGER DEFAULT 100,
                                                                            debugmodeon INTEGER DEFAULT 0)`,
                                                                            []).then((data) => 
                    {resolve(data);
       },
       (error) => {
           console.log(error);
           reject(error);
           });
   });
}

public getAppSettings(){
    this.createTableAppSettings();
      return new Promise((resolve, reject) => { 
            this.storage.executeSql('SELECT * FROM appsettings',[]).then((data) =>{               
                if (data && data.rows.length > 0){                        
                    let setting = new AppSettings(data.rows.item(0).imagequality, data.rows.item(0).debugmodeon);
                    resolve(setting);
                }else{
                    resolve(new AppSettings(100, false));
                }
            }, (error) => {
                console.log(error);
                reject(error);
            });
      });                                 
}

public alterAppSettingsIfDebugmodeNotExists(){
return new Promise((resolve, reject) => {
          this.platform.ready().then(() => {
            let debugmodeExists : boolean = false;
            this.storage.executeSql("PRAGMA table_info(appsettings)", []).then((data) => {          
             if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {                      
                        if (data.rows.item(i).name === "debugmodeon"){
                            debugmodeExists = true;                                                     
                        }
                    }
                    if (!debugmodeExists){
                        this.storage.executeSql(`ALTER TABLE appsettings ADD COLUMN debugmodeon INTEGER DEFAULT 0`, []);        
                        console.log("debug added");                                          
                                 resolve(data);                 
                    }
                    else{                        
                           resolve(data); 
                   }         
             }
                             
            }, (error) => {        
                console.log(error);       
                reject(error);
            });
          });   
        }); 
}

public addDefaultAppSettings(){
  this.createTableAppSettings();
  this.alterAppSettingsIfDebugmodeNotExists();

  return new Promise((resolve, reject) => { 
  this.storage.executeSql("SELECT count(*) AS rowcount FROM appsettings",[]).then((data) =>
                            {
                             if ((!data.rows.item(0).rowcount) || (data.rows.item(0).rowcount === 0)){
                                    this.storage.executeSql(`INSERT INTO appsettings 
                                                                    (imagequality, debugmodeon)
                                                                    VALUES (?, ?)`,
                                                                    [100, 0]).then((data) =>
                                                                    {
                                                                        resolve(data);
                                                                    }, 
                                                                    (error) => {
                                                                        reject(error);
                                                                    });
                             }                 
                            },
                        (error) =>{
                            reject(error);
        });
    });
  }

public saveImageQualitySettings(imageQuality){
  this.createTableUserSettings();
  return new Promise((resolve, reject) => { 
  this.storage.executeSql("SELECT count(*) AS rowcount FROM appsettings",[]).then((data) =>
                            {
                             if (data.rows.item(0).rowcount && data.rows.item(0).rowcount > 0 ){
                                this.storage.executeSql(`UPDATE appsettings
                                                            SET imagequality = ? `, 
                                                                [imageQuality]).then((data) =>
                                                                {
                                                                    resolve(data);
                                                                 }, (error) =>{
                                                                     reject(error);
                                                                });
                             }
                             else{
                                this.storage.executeSql(`INSERT INTO appsettings 
                                                                (imagequality, debugmodeon)
                                                                VALUES (?, ?)`,
                                                                [imageQuality, 0]).then((data) =>
                                                                {
                                                                    resolve(data);
                                                                }, 
                                                                (error) => {
                                                                    reject(error);
                                                                });
                             }
                            },
                        (error) =>{
                            reject(error);
        });
    });
  }

public saveDebugModeSettings(debugMode: Boolean){
  this.createTableUserSettings();
  return new Promise((resolve, reject) => { 
  this.storage.executeSql("SELECT count(*) AS rowcount FROM appsettings",[]).then((data) =>
                            {
                             if (data.rows.item(0).rowcount && data.rows.item(0).rowcount > 0 ){
                                this.storage.executeSql(`UPDATE appsettings
                                                            SET debugmodeon = ? `, 
                                                                [debugMode]).then((data) =>
                                                                {
                                                                    resolve(data);
                                                                 }, (error) =>{
                                                                     reject(error);
                                                                });
                             }
                             else{
                                this.storage.executeSql(`INSERT INTO appsettings 
                                                                (imagequality, debugmodeon)
                                                                VALUES (?)`,
                                                                [100, debugMode]).then((data) =>
                                                                {
                                                                    resolve(data);
                                                                }, 
                                                                (error) => {
                                                                    reject(error);
                                                                });
                             }
                            },
                        (error) =>{
                            reject(error);
        });
    });
  }

public getSiteBudgetProgress(siteID: number){
    return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT  sublocationconstage.*
                                     FROM   sublocationconstage    
                                     INNER JOIN sublocation ON sublocation.recordid = sublocationconstage.sublocationid                        
                                     WHERE  sublocation.siteid = ? AND sublocationconstage.progressdate IS NOT NULL 
                                            `
                                    ,[siteID]).then((data) => {
                                          let budgetItems =  new Array<BudgetProgress>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                if(data.rows.item(i).newworkprogress !== null &&  data.rows.item(i).newworkprogress !== ""){
                                                        let budgetItem = 
                                                        new BudgetProgress( data.rows.item(i).sublocationid,
                                                                            data.rows.item(i).constageid,   
                                                                            data.rows.item(i).newworkprogress)
                                                            budgetItems.push(budgetItem); 
                                                        }
                                                }                                                       
                                            }                                            
                                            resolve(budgetItems);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
                                });
}

public getSiteBudgetNotes(siteID: number){
  return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT   notes.*,  sublocationconstage.sublocationid, sublocationconstage.constageid
                                     FROM       notes                                       
                                     INNER JOIN sublocationconstage ON sublocationconstage.recordid = notes.sublocationconstageid    
                                     INNER JOIN sublocation ON sublocation.recordid = sublocationconstage.sublocationid                        
                                     WHERE  sublocation.siteid = ? `
                                    ,[siteID]).then((data) => {
                                          let budgetNotes =  new Array<BudgetProgressNotes>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {                                              
                                                let budgetNote : BudgetProgressNotes;                                           
                                                  budgetNote =   new BudgetProgressNotes(data.rows.item(i).sublocationid,
                                                                                          data.rows.item(i).constageid, 
                                                                                          data.rows.item(i).notes, 
                                                                                         data.rows.item(i).notedatetime);
                                                              budgetNotes.push(budgetNote); 
                                                }                                     
                                                  
                                            }
                                            resolve(budgetNotes);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
                                });
}

public getSiteAppmeasureProgress(siteID: number){
 return new Promise((resolve, reject) => {
        this.storage.executeSql(`SELECT  appmeasureitems.*
                                  FROM   appmeasureitems    
                                  INNER JOIN sublocation ON sublocation.recordid = appmeasureitems.sublocationid                        
                                  WHERE  sublocation.siteid = ?  
                                        AND appmeasureitems.progressdate IS NOT NULL
                                   `,[siteID]).then((data) => {
                                          let appItems =  new Array<AppMeasureProgress>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {                                           
                                                   let noPValue = false;
                                                   if (data.rows.item(i).newprogressqty === null || data.rows.item(i).newprogressqty === ""){
                                                            noPValue = true;
                                                   }
                                                   let noMValue = false;
                                                   if(data.rows.item(i).newmosqty === null || data.rows.item(i).newmosqty === ""){
                                                       noMValue = true;
                                                   }
                                                   if (noMValue === true && noPValue === true){
                                                        // dont include
                                                   }else{
                                                        let appItem = 
                                                        new AppMeasureProgress(data.rows.item(i).recordid,
                                                                            data.rows.item(i).sublocationid,
                                                                            data.rows.item(i).constageid,   
                                                                            data.rows.item(i).newprogressqty,                                                                 
                                                                            data.rows.item(i).newmosqty)
                                                        appItems.push(appItem); 
                                                   }                                                   
                                               //  }                                                   
                                                }
                                            }                                           
                                            resolve(appItems);
                                        },
                                            (error) => {
                                                reject(error);
                                            });
                                });
}

public getSiteAppmeasureNotes(siteID: number){
      return new Promise((resolve, reject) => {
            this.storage.executeSql(`SELECT appmeasurenotes.*, appmeasureitems.constageid,  appmeasureitems.sublocationid
                                     FROM appmeasurenotes
                                      INNER JOIN appmeasureitems ON appmeasureitems.recordid =  appmeasurenotes.appmeasureitemid 
                                      INNER JOIN sublocation ON sublocation.recordid = appmeasureitems.sublocationid                        
                                     WHERE  sublocation.siteid = ?
                                       `, 
                                        [siteID]).then((data) => 
            {let notes =  new Array<AppmeasureProgressNotes>();
                                            if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                let appNote = 
                                                new AppmeasureProgressNotes(data.rows.item(i).sublocationid,
                                                                            data.rows.item(i).constageid,
                                                                                data.rows.item(i).appmeasureitemid,
                                                                                data.rows.item(i).notes,                                                                  
                                                                                data.rows.item(i).notedatetime)
                                                    notes.push(appNote); 
                                                }
                                            }
                resolve(notes);
            }, 
                (error) => {
                reject(error);
            });
        }); 
}

public deleteSiteNotes(siteID: number){
    return new Promise((resolve, reject) => {
      this.storage.executeSql(`DELETE FROM notes 
                                  WHERE notes.sublocationconstageid IN 
                                    (SELECT sublocationconstage.recordid 
                                      FROM sublocationconstage 
                                      INNER JOIN sublocation ON sublocation.recordid = sublocationconstage.sublocationid
                                      WHERE sublocation.siteid = ? )`, 
                                    [siteID]).then((data) =>  { 
                 this.storage.executeSql(`DELETE FROM appmeasurenotes
                                            WHERE appmeasurenotes.appmeasureitemid IN
                                            (SELECT appmeasureitems.recordid 
                                                FROM  appmeasureitems
                                                INNER JOIN  sublocation 
                                                 ON sublocation.recordid = appmeasureitems.sublocationid
                                            WHERE sublocation.siteid = ?)`, [siteID]).then(() =>{
                                                resolve(data);
                                     
                                      }, (error) =>{
                                         reject(error);
                                       });               
                }, (error) => {
                    reject(error);
                });
    });
}

public createTablesSitetProgressResponse(){
 return new Promise((resolve, reject) => {     
        this.storage.executeSql(`CREATE TABLE IF NOT EXISTS siteprogressresponse (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                                    siteid INTEGER NOT NULL,
                                                                                    status INTEGER,
                                                                                    transactionid TEXT,
                                                                                    responsedatetime TEXT)`,
                                                                                    []).then((data) =>          
       
         {
            this.storage.executeSql(`CREATE TABLE IF NOT EXISTS budgetprogressresponse (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                                         siteid INTEGER NOT NULL,
                                                                                         stageid INTEGER NOT NULL,
                                                                                         plotid INTEGER NOT NULL,
                                                                                         actualprogress INTEGER,
                                                                                         message TEXT)`,[]).then((data)=>{

            this.storage.executeSql(`CREATE TABLE IF NOT EXISTS appmeasureprogressresponse (recordid INTEGER PRIMARY KEY  NOT NULL,
                                                                                             siteid INTEGER NOT NULL,
                                                                                            stageid INTEGER NOT NULL,
                                                                                            plotid INTEGER NOT NULL,
                                                                                            actualprogressqty INTEGER,
                                                                                            message TEXT)`, []).then((data) =>{
                                resolve(data); 
             }, (error) => {reject(error);});
                       
            },(error) => {reject(error);});
            
       },(error) => {reject(error);});
   });
}

public InsertSiteProgressSubmitResponse(response: SiteProgressResponse, responseTime: string, siteID: number){
    this.createTablesSitetProgressResponse();
     this.DeleteResponseTableEntriesForSite(siteID);
    return new Promise((resolve, reject) =>{
            this.storage.executeSql(`INSERT INTO siteprogressresponse
                                                    (siteid,
                                                     status,
                                                     transactionid,
                                                     responsedatetime) 
                                            VALUES (?, ?, ?, ?) `,[siteID, response.returnCode, response.transactionID, responseTime]).then((data) => {
                                                console.log("site response saved");
                                       if (response.responseData && response.returnCount > 0)
                                       {
                                           let plotsProgress = response.responseData;
                                           for (let result of plotsProgress){
                                                if (result){
                                                    this.InsertBudgetProgressResponse(result, siteID);
                                                }
                                           }
                                       }
                                       if (response.appMeasureResponseData && response.appMeasureReturnCount > 0){
                                           for ( let appProgress of response.appMeasureResponseData){
                                               if (appProgress){
                                                   this.InsertAppMeasureResponse(appProgress, siteID);
                                               }
                                           }
                                       } 
                                        resolve(data);
            }, (error) => {
                console.log(error);
                reject(error);});
    });
}

public InsertBudgetProgressResponse(budgetResponse: any, siteID: number){
      return new Promise((resolve, reject) => {
            this.storage.executeSql(`INSERT OR REPLACE INTO budgetprogressresponse ( siteid,
                                                                                     plotid,
                                                                                     stageid,                                                                     
                                                                                     actualprogress,
                                                                                     message) 
                                                                                       VALUES (?, ?, ?, ?, ?)`, 
                                                                                        [siteID, budgetResponse.plotID, budgetResponse.constructionStageID,
                                                                                         budgetResponse.actualWorkProgress , budgetResponse.message]).then((data) => 
            { console.log("progress resp saved");
                resolve(data);
            }, (error) => {
                  console.log(error);
                  reject(error);});
        });
}


public InsertAppMeasureResponse(appmeasureResponse: any,  siteID: number){
      return new Promise((resolve, reject) => {
            this.storage.executeSql(`INSERT OR REPLACE INTO appmeasureprogressresponse (recordid,
                                                                                        siteid,
                                                                                        plotid,
                                                                                        stageid,                                                                     
                                                                                        actualprogressqty,
                                                                                        message) 
                                                                                        VALUES (?, ?, ?, ?, ? ,?)`, 
                                                                                        [appmeasureResponse.recordID,siteID, appmeasureResponse.plotID, appmeasureResponse.constructionStageID,
                                                                                         appmeasureResponse.actualWorkProgress , appmeasureResponse.message]).then((data) => 
            { console.log("app progress resp saved");
                resolve(data);
            }, (error) => {  console.log(error);
                reject(error);});
        });
}


public getSiteProgressResponseResults(siteID: number){

  this.createTablesSitetProgressResponse(); 
    return new Promise((resolve, reject)=>{
     let siteProgressResult = new SiteProgressResults();
        this.storage.executeSql(`SELECT * FROM siteprogressresponse
                                    WHERE siteid = ?`, [siteID]).then((data) =>{
                                       console.log(data);
                                        if(data.rows.length > 0) {                                          
                                           siteProgressResult.SiteID = siteID;
                                           siteProgressResult.Status = data.rows.item(0).status;
                                           siteProgressResult.ResultDateTime = data.rows.item(0).responsedatetime;
                                            console.log(siteProgressResult);
                                        }
            this.storage.executeSql(`SELECT budgetprogressresponse.* , sublocation.primaryname, constage.description
                                     FROM budgetprogressresponse
                                     INNER JOIN sublocation ON sublocation.recordid = budgetprogressresponse.plotid
                                     INNER JOIN constage ON constage.constageid = budgetprogressresponse.stageid AND 
                                                constage.siteid = budgetprogressresponse.siteid
                                     WHERE budgetprogressresponse.siteid = ?
                                            AND constage.siteid = ?
                                    ORDER BY budgetprogressresponse.plotid`,[siteID, siteID]).then((data) =>{
                                                console.log("budgetresponse");
                                                let budgetProgressResp = new Array<BudgetProgressResult>();
                                                if(data.rows.length > 0) {
                                                for(let i = 0; i < data.rows.length; i++) {
                                                let budgetProgress = 
                                                new BudgetProgressResult(data.rows.item(i).plotid,
                                                                    data.rows.item(i).stageid,
                                                                    data.rows.item(i).actualprogress,                                                                  
                                                                    data.rows.item(i).message,
                                                                    data.rows.item(i).primaryname,
                                                                    data.rows.item(i).description)
                                                    budgetProgressResp.push(budgetProgress); 
                                                    siteProgressResult.BudgetResult = budgetProgressResp;
                                                }
                                            }

                this.storage.executeSql(`SELECT appmeasureprogressresponse.* , appmeasureitems.description, sublocation.primaryname AS plot, constage.description AS stage
                                         FROM     appmeasureprogressresponse
                                         INNER JOIN appmeasureitems ON appmeasureprogressresponse.recordid = appmeasureitems.recordid
                                         INNER JOIN sublocation ON sublocation.recordid = appmeasureprogressresponse.plotid
                                         INNER JOIN constage ON constage.constageid = appmeasureprogressresponse.stageid AND 
                                                constage.siteid = appmeasureprogressresponse.siteid
                                         WHERE appmeasureprogressresponse.siteid = ?
                                         ORDER BY appmeasureprogressresponse.plotid`,[siteID]).then((data) =>{
                                                    console.log("appmeasureresponse");
                                            let appProgressResults = new Array<AppMeasureProgressResult>();
                                                if(data.rows.length > 0) {
                                                    for(let i = 0; i < data.rows.length; i++) {
                                                        let appResult = 
                                                        new AppMeasureProgressResult(
                                                                            data.rows.item(i).recordid,
                                                                            data.rows.item(i).plotid,
                                                                            data.rows.item(i).stageid,
                                                                            data.rows.item(i).description,                                                                  
                                                                            data.rows.item(i).actualprogressqty,
                                                                            data.rows.item(i).message);
                                                                            appResult.PlotName = data.rows.item(i).plot;
                                                                            appResult.StageName = data.rows.item(i).stage;
                                                            appProgressResults.push(appResult); 
                                                            siteProgressResult.AppmeasureItemsResult = appProgressResults;
                                                       
                                                    }
                                                }                                
                                 resolve(siteProgressResult);

                }, (error) =>{ reject(error);});
            }, (error) =>{ reject(error);});
        }, (error) =>{ reject(error);});
    });
}

public DeleteResponseTableAllEntries(){
  return new Promise((resolve, reject) => {
            this.storage.executeSql(`DELETE FROM appmeasureprogressresponse`,[]);
            this.storage.executeSql(`DELETE FROM budgetprogressresponse`,[]);
             this.storage.executeSql(`DELETE FROM siteprogressresponse`,[]);
        });
}

public DeleteResponseTableEntriesForSite(siteid: number){
  return new Promise((resolve, reject) => {
            this.storage.executeSql(`DELETE FROM appmeasureprogressresponse WHERE siteid = ?`,[siteid]);
            this.storage.executeSql(`DELETE FROM budgetprogressresponse WHERE siteid = ?`,[siteid]);
             this.storage.executeSql(`DELETE FROM siteprogressresponse WHERE siteid = ?`,[siteid]);
        });
}


public createTables(){    
    this.createSitesTable();
    this.createSubLoctionTable();
    this.createConstructionStageHeaderTable();
    this.createConstructionStageTable();
    this.createSubLocationConstructionStageTable();
    this.createSubLocationConstructionStageAttachmentTable();
    this.createSubLocationConstructionStageNotesTable();
    this.createAppMeasureItemsTable();
    this.createAppMeasureNotesTable();
    this.addDefaultAppSettings();
}

public removeSiteRecordFromSiteTable(siteID: number){
  return new Promise((resolve, reject) => {
     this.storage.executeSql(`DELETE FROM sites
                                            WHERE recordid = ?`,[siteID]).then((data) =>{
                                    resolve(data);
                                  }
                            , (error)=>{
                                console.log(error);
                                reject(error);
                           });
  });
}

public removeAttachmentsRecordsForSite(siteID: number){
    return new Promise((resolve, reject) =>{
            this.storage.executeSql(`DELETE FROM attachments 
                                    WHERE attachments.sublocationid IN 
                                     (SELECT recordid 
                                        FROM  sublocation 
                                        WHERE sublocation.siteid = ?)`,[siteID]).then(() =>{
                                            resolve();
                                        }, (error) => {reject(error)});
    });
}

public removeSiteData(siteID: number, removeSiteRecord: boolean, removeAttachments: boolean){
    return new Promise((resolve, reject) => {    
         if (removeAttachments){
             this.removeAttachmentsRecordsForSite(siteID);
         }
    this.storage.executeSql(`DELETE FROM appmeasurenotes
                                    WHERE appmeasurenotes.appmeasureitemid IN
                                    (SELECT appmeasureitems.recordid 
                                       FROM  appmeasureitems
                                       INNER JOIN  sublocation 
                                          ON sublocation.recordid = appmeasureitems.sublocationid
                                       WHERE sublocation.siteid = ?)`, [siteID]).then(() =>{

      this.storage.executeSql(`DELETE FROM appmeasureitems
                                    WHERE appmeasureitems.sublocationid IN
                                    (SELECT recordid 
                                      FROM  sublocation 
                                     WHERE sublocation.siteid = ?)`, [siteID]).then(() =>{

         this.storage.executeSql(`DELETE FROM notes 
                                  WHERE notes.sublocationconstageid IN 
                                    (SELECT sublocationconstage.recordid 
                                      FROM sublocationconstage 
                                      INNER JOIN sublocation ON sublocation.recordid = sublocationconstage.sublocationid
                                      WHERE sublocation.siteid = ? )`,[siteID]).then(()=> {
                
        //    this.storage.executeSql(`DELETE FROM attachments 
        //                             WHERE attachments.sublocationid IN 
        //                              (SELECT recordid 
        //                                 FROM  sublocation 
        //                                 WHERE sublocation.siteid = ?)`,[siteID]).then(() =>{

               this.storage.executeSql(`DELETE FROM sublocationconstage
                                        WHERE sublocationconstage.sublocationid IN
                                        (SELECT recordid 
                                        FROM  sublocation 
                                        WHERE sublocation.siteid = ?)`, [siteID]).then(() =>{

                this.storage.executeSql(`DELETE FROM constage                                            
                                         WHERE  siteid = ?`, [siteID]).then(() => {
                 
                 this.storage.executeSql(`DELETE FROM constageheader
                                            WHERE siteid = ?`,[siteID]).then(() =>{

                    this.storage.executeSql(`DELETE FROM sublocation
                                            WHERE siteid = ?`,[siteID]).then((data) =>{                             
                             if (removeSiteRecord){
                                 this.removeSiteRecordFromSiteTable(siteID);
                             }
                             resolve(data);                        
                         }
                         , (error)=>{
                            console.log(error);
                            reject(error);
                        });
                      }
                       , (error)=>{
                         console.log(error);
                         reject(error);
                     });
                    }
                    , (error)=>{
                        console.log(error);
                          reject(error);
                   });                    
                  }, (error) => {
                      console.log(error);
                      reject(error);
                  });
                //  }, 
                //   (error)=>{
                //       console.log(error);
                //       reject(error);
                //   });              
            }, 
            (error) =>{
                console.log(error);
                 reject(error);
        });        
        }
         , (error)=>{
             console.log(error);
                reject(error);    
    });    
   }, 
   (error) => {
       console.log(error);
       reject(error);
   });
 });
}

public removeAllData(){
    return new Promise((resolve, reject) => {      
       
    this.storage.executeSql(`DELETE FROM appmeasurenotes`,[]).then(() =>{
      this.storage.executeSql(`DELETE FROM appmeasureitems`,[]).then(() =>{
         this.storage.executeSql(`DELETE FROM notes`,[]).then(()=> {                
           this.storage.executeSql(`DELETE FROM attachments`,[]).then(() =>{
               this.storage.executeSql(`DELETE FROM sublocationconstage`, []).then(() =>{
                this.storage.executeSql(`DELETE FROM constage`,[]).then(() => {                 
                 this.storage.executeSql(`DELETE FROM constageheader`,[]).then(() =>{
                   this.storage.executeSql(`DELETE FROM sublocation`,[]).then((data) =>{                             
                     this.storage.executeSql(`DELETE FROM sites`,[]).then((data) =>{
                        this.storage.executeSql(`DELETE FROM registration`,[]).then((data) =>{
                                              resolve(data);
                                        },(error) =>{
                                                console.log(error);
                                                reject(error);
                                        });                                   
                                  }
                            , (error)=>{
                                console.log(error);
                                reject(error);
                           });                                                    
                         }
                         , (error)=>{
                            console.log(error);
                            reject(error);
                        });
                      }
                       , (error)=>{
                         console.log(error);
                         reject(error);
                     });
                    }
                    , (error)=>{
                        console.log(error);
                          reject(error);
                   });                    
                  }, (error) => {
                      console.log(error);
                      reject(error);
                  });
                 }, 
                  (error)=>{
                      console.log(error);
                      reject(error);
                  });              
            }, 
            (error) =>{
                console.log(error);
                 reject(error);
        });        
        }
         , (error)=>{
             console.log(error);
                reject(error);    
    });    
   }, 
   (error) => {
       console.log(error);
       reject(error);
   });
 });
}


}