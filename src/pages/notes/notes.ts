import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, NavParams, ViewController } from 'ionic-angular';
import {Database} from "../../providers/database"; 
import {PlotStageProgress} from '../br.classes/sublocation';
import {SubLocationConStageNote} from '../br.classes/sublocationconstageattachments';
/*
  Generated class for the NotesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'notes.html',
})
export class NotesPage implements OnInit {
progressID: number;
notes : SubLocationConStageNote[];
comment: string;
  constructor(public modalCtrl: ModalController,
               public params: NavParams,
               public viewCtrl: ViewController,
               public dataservice: Database) {    
   
   this.progressID = <number> this.params.get("progressID");
  
  }

ngOnInit() : void { 
       this.getNotes();     
}

getNotes(){
  this.dataservice.getPlotConStageNotes(this.progressID).then((result) => {     
         this.notes = <SubLocationConStageNote[]> result;
       }
      ,(error) => {
                  console.log("ERROR: ", error.message);
              });
}

dismiss() {
    this.viewCtrl.dismiss();
  }

editNote(id: number, text: string){

  this.dataservice.editPlotConstructionStageNotes(id, text);
}

addNote() {
      this.dataservice.addPlotConstructionStageNotes(this.progressID, this.comment, new Date().toISOString());
       this.getNotes(); 
      this.comment = "";
  }

  deleteNote(note : SubLocationConStageNote)
  {
    this.dataservice.deletePlotConstructionStageNotes(note.RecordID).then((data) =>{
          this.getNotes(); 
    }, (error) => {
      console.log(error);
    });       
  }
}
