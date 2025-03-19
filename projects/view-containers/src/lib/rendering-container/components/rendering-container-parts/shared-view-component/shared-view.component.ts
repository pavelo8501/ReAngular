import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerNodeComponent } from './../container-node/container-node.component';

@Component({
  selector: 'lib-shared-view-component',
  imports: [CommonModule],
  templateUrl: './shared-view.component.html',
  styleUrl: './shared-view.component.css',
})


export class SharedViewComponentComponent extends ContainerNodeComponent<any> {


  override classList = signal<{key:number, value:string}[]>([])

}
