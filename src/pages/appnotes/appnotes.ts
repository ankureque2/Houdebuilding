import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import {Database} from "../../providers/database";
import {AppMeasureItemNote} from '../br.classes/appmeasureitem'; 
/*
  Generated class for the Appnotes page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-appnotes',
  templateUrl: 'appnotes.html'
})
export class AppnotesPage {
  AppItemID : number;
  notes: AppMeasureItemNote[];
  comment: string 
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public viewCtrl: ViewController,
              private database: Database) {
      this.AppItemID = <number> navParams.get("AppItemID");
  }

  ionViewDidLoad() {
    //get app notes
   this.getAppmeasureNotes();  
  }

dismiss() {
    this.viewCtrl.dismiss();
  }

   getAppmeasureNotes(){
         this.database.getAppMeasureNotes(this.AppItemID).then((data) => {
                                         this.notes = <AppMeasureItemNote[]> data;
                                       },
                                       (error) =>{
                                       });
  }

editNote(id: number, text: string){

  this.database.editAppMeasureNote(id, text);
}

addNote() {
      this.database.addAppMeasureNote(this.AppItemID, this.comment, new Date().toISOString()).then(()=>{
        this.getAppmeasureNotes();},
        error=> {console.log(error)});    
      this.comment = "";
  }

  deleteNote(note : AppMeasureItemNote)
  {
    this.database.deleteAppMeasureItemNotes(note.RecordID).then((data) =>{
           this.getAppmeasureNotes();
    }, (error) => {
      console.log(error);
    });       
  }
}
