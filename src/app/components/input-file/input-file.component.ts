import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.scss'],
})
export class InputFileComponent implements OnInit {
  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() multiple!: boolean;
  @Input() accept!: string | undefined;
  @Input() color!: ThemePalette;
  @Input() hint!: string | undefined;
  @Input() maxSize!: number;

  maxSizeInMB!: number;
  private _destroy$ = new Subject<boolean>();

  constructor() {}

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        if (res?.size && res.size > this.maxSize) {
          this.control.setValue(null);
          this.control.setErrors({ overSize: true });
          this.maxSizeInMB = this.maxSize / 1024 / 1024;
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}
