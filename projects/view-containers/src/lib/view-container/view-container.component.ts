import { Component, input, AfterViewInit, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContainerSelector } from '../../common/models/container-selector.model';
import {HtmlTag} from "./../../common/enums"


@Component({
  selector: 'lib-view-container',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-container.component.html',
  styleUrl: './view-container.component.css',
})
export class ViewContainerComponent implements OnInit,  AfterViewInit { 

  HtmlTag = HtmlTag
  selector = input.required<ContainerSelector>()

  content = input<string>()


  ngOnInit(): void {
    console.log(`ViewContainerComponent:ngOnInit() selector id : ${this.selector().id}  selector tag ${this.selector().tag}}`)
  }


  ngAfterViewInit(): void {
    console.log(`ViewContainerComponent:ngAfterViewInit() selector id : ${this.selector().id}  selector tag ${this.selector().tag}}`)
  }


}
