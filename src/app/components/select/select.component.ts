import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnInit {
  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() hint!: string;
  @Input() options!: string[] | undefined;

  constructor() {}

  ngOnInit() {}
}
