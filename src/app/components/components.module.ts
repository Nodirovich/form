import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { InputComponent } from './input/input.component';
import { SelectComponent } from './select/select.component';
import { InputFileComponent } from './input-file/input-file.component';
import { DialogComponent } from './dialog/dialog.component';
import { TranslateModule } from '@ngx-translate/core';

const COMPONENTS = [
  InputComponent,
  SelectComponent,
  InputFileComponent,
  DialogComponent,
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgxMatFileInputModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class ComponentsModule {}
