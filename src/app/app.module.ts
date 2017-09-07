import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import { MyApp } from './app.component';
import { PlotPage} from '../pages/plot/plot';
//import { PlotsPage} from '../pages/plots/plots';
import { Register} from '../pages/register/register';
import { StagesPage} from '../pages/stages/stages';
import { AllSites } from '../pages/sites/all/all';
import { SelectedSites } from '../pages/sites/selected/selected';
import { DetailsPage } from '../pages/sites/details/details';
import { Sites} from '../pages/sites/sites';
import { SublocationsPage} from '../pages/sublocations/sublocations';
import { PopoverPage } from '../pages/sublocations/popoverpage';
import { PlotsService } from '../providers/plotsservice';
import { Database} from '../providers/database';
import { RegistrationService} from '../providers/registration-service';
import { SitesService } from '../pages/sites/sites.service';
import { SiteService } from '../providers/site-service';
import {StageFilterPipe} from '../pages/stages/stage.pipe';
import {NotesPage} from '../pages/notes/notes';
import {GalleryPage} from '../pages/gallery/gallery';
import { TextMaskModule } from 'angular2-text-mask';
import {PlotOptionsPage} from '../pages/plot/plotoptions';
import {AppmeasureitemsPage} from '../pages/appmeasureitems/appmeasureitems';
import {AppnotesPage} from '../pages/appnotes/appnotes';
import {SubmitSitePage} from '../pages/submitsite/submitsite';
import {PlotFilterPage} from '../pages/plot/plotfilteroptions';
import {StageListPage} from '../pages/stagelist/stagelist';
import {InfoPage} from '../pages/info/info'
import {CopyProgressPage} from '../pages/copyprogress/copyprogress';
import {ProgressresultsPage} from '../pages/progressresult/progressresults';
import { Keyboard } from 'ionic-native';
import {SQLite} from 'ionic-native';
@NgModule({
  declarations: [
    MyApp,
    Sites,
    Register,
    AllSites, 
    SelectedSites,
    DetailsPage,  
    StagesPage,  
    SublocationsPage,
    PlotPage,  
    NotesPage,
    StageFilterPipe,
    PopoverPage,
    GalleryPage,
    PlotOptionsPage,
    AppmeasureitemsPage,
    AppnotesPage,
    PlotFilterPage,
    SubmitSitePage,
    StageListPage,
    CopyProgressPage,
    ProgressresultsPage,
    InfoPage

  ],
  imports: [
    IonicModule.forRoot(MyApp), FormsModule, BrowserModule, TextMaskModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Sites,
    Register,
    AllSites, 
    SelectedSites,
    DetailsPage,
    StagesPage,  
    SublocationsPage,
    PlotPage,
    NotesPage,
    PopoverPage,
    GalleryPage,
    PlotOptionsPage,
    AppmeasureitemsPage,
    AppnotesPage,
    PlotFilterPage,
    SubmitSitePage,
    StageListPage,
    CopyProgressPage,
    ProgressresultsPage,
    InfoPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, SitesService, PlotsService, Database, RegistrationService, SiteService, SQLite, Keyboard]
})
export class AppModule {}
