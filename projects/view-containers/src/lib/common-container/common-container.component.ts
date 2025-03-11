import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-common-container',
  imports: [CommonModule],
  templateUrl: './common-container.component.html',
  styleUrl: './common-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonContainerComponent { }
