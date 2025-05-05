import { Component, input, AfterViewInit, OnInit, computed, signal, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from '@angular/common';
import { ContainerSelector, SelectorInterface } from './../common/models/container-selector.model';
import {HtmlTag} from './../common/enums'
import { DataInterface, DataServiceInterface } from "../common/data-handling/data-service.interface";


@Component({
  selector: 'lib-view-container',
  standalone: true,
  imports:[
    CommonModule,
  ],
  templateUrl: './view-container.component.html',
  styleUrl: './view-container.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewContainerComponent implements  AfterViewInit { 

  HtmlTag = HtmlTag
  selector = input.required<ContainerSelector>()
  name = computed<string>(()=>{return this.selector().id})

  dataService = input<DataServiceInterface|undefined>()

  dataModel = signal<DataInterface|undefined>(undefined)
  
  content = computed<string | undefined>( () =>  { return this.dataModel()?.content })

  showAttachedContent = input<boolean>(false)


  updateData(model : DataInterface){
    console.log(`ContentRendererComponent: updateData() receivd new model for update : ${model.selector}`)
      this.dataModel.set(model)
  }

  ngAfterViewInit(): void {
    console.log(`ViewContainerComponent:ngAfterViewInit() selector id : ${this.selector().id}  selector tag ${this.selector().tag}}`)

    const data = this.dataModel()

    if(data == undefined){
        const dataService =  this.dataService()
        if(dataService){
           dataService.getDataForContainer(this.selector()).then((dataRecord)=>{
            this.dataModel.set(dataRecord)
          })
        }else{
            console.warn(`No data source ingected for selector ${this.selector().tag} `);
        }
    }else{
      console.log(`ContentRendererComponent:ngAfterViewInit: sectionData is ${data.selector.id} skip update`)
    }

  }


}
