import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContainerSelector } from '../../common/models/container-selector.model';

@Component({
  selector: 'lib-view-container',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-container.component.html',
  styleUrl: './view-container.component.css',
})
export class ViewContainerComponent { 


  selector = input<string>()


}
