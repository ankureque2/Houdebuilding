import {Pipe, PipeTransform} from '@angular/core';
import{PlotStageDetails} from '../br.classes/sublocation';
@Pipe({
    name: 'stageFilter'
})

export class StageFilterPipe implements PipeTransform {
   transform(value: PlotStageDetails[], args: {[headerId: number]: any}): PlotStageDetails[] {     
        let filter: number =  args["headerId"] ;     
       if (filter === null && filter === undefined){
            return value; 
       }
      else{
          return  value.filter((stage: PlotStageDetails) =>
            stage.ConStageHeaderID == filter);
        }
        // return filter ? value.filter((stage: PlotStageDetails) =>
        //     stage.ConStageHeaderID == filter) : value; 
    }
}