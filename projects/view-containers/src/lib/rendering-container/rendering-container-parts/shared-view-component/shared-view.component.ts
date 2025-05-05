import { ChangeDetectionStrategy, Component, input, signal, AfterViewInit, effect, model } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerNodeComponent } from './../container-node/container-node.component';
import { ContainerState, EventType } from "./../../../common/enums"

import { EventSubject } from './../../models';

import {InjectableI} from "./../../interfaces"


@Component({
  standalone:true,
  selector: 'lib-shared-view-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-view.component.html',
  styleUrl: './shared-view.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})


export class SharedViewComponentComponent<T extends   InjectableI>  extends ContainerNodeComponent<T>  implements AfterViewInit {

  ContainerState = ContainerState

  override canSelect:boolean = true
  classListEdit = model<{key:number, value:string}[]>([])
  override classes = signal<string[]>([])
  componentClasses = input<string[]>([])
  componentId = input<string>()
  componentKey = input<string>("no key info")


  override updateView = () => {

  }


  constructor(private cdr: ChangeDetectorRef){
    super()
    effect(()=>{
      const state = this.containerState()
      if(state){

        switch(state){
          case ContainerState.IDLE:

            console.log(this.dataModel.class_list)
          break
          case ContainerState.EDIT:
            this.classListEdit.set(this.dataModel.class_list)
          break
        }
      }})
  }

  override ngAfterViewInit(): void {

    this.renderingContainer.listen().subscribe((event: EventSubject)=>{
        switch(event.eventType){
          case EventType.ON_LOST_FOCUS:
            if(this.canSelect){
              this.containerState.set(ContainerState.IDLE)
            }
          break;
          case EventType.CAN_SELECT:
            const val =  event.value as boolean
            this.canSelect = val
          break
          case EventType.UPDATE_VIEW:
            console.log(`Updating`)
            
            
           // this.updateView()

            break

        }
    })
  }
}
