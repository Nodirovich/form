import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, of, take } from 'rxjs';
import { DialogComponent } from './components/dialog/dialog.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface IOption {
  label: string;
  control: string;
  hint?: string;
  type?: string;
  list?: (string | number)[];
  accept?: string;
  maxSize?: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly select: string = 'select';

  private readonly fileType: string[] = [
    'Изображение',
    'Текст',
    'Аудио',
    'Видео',
    'Диаграмма',
    'Карта-схема',
    'Таблица',
    'Ссылка',
  ];

  private readonly layerTheme: string[] = [
    'Области',
    'Районы',
    'Населенные пункты',
    'Промышленность',
    'Сельское хозяйство',
    'Электростанции',
    'Наука и образование',
    'Культура и Искусство',
  ];

  readonly fileMaxSize = 200 * 2 ** 20;
  readonly navigationMaxSize = 10 * 2 ** 20;

  options: IOption[];
  form: FormGroup;
  constructor(
    private readonly fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      fio: ['', Validators.required],
      work: ['', Validators.required],
      position: ['', Validators.required],
      layerTheme: [null, Validators.required],
      chronology: [null, Validators.required],
      fileType: [null, Validators.required],
      file: ['', Validators.required],
      navigation: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.email],
    });

    this.options = [
      {
        label: 'Фамилия Имя Отчество',
        hint: '',
        type: '',
        control: 'fio',
      },
      {
        label: 'Место работы',
        hint: 'Название вуза, название факультета, название кафедры',
        control: 'work',
      },
      {
        label: 'Должность',
        hint: 'Какой курс, номер группы или должность, звание',
        type: '',
        control: 'position',
      },
      {
        label: 'Выбор темы слоя',
        type: this.select,
        list: this.layerTheme,
        control: 'layerTheme',
      },
      {
        label: 'Выбор хронологии',
        hint: '',
        type: this.select,
        control: 'chronology',
        list: this.chronologyList,
      },
      {
        label: 'Тип данных',
        hint: '',
        type: this.select,
        control: 'fileType',
        list: this.fileType,
      },
      {
        label: 'Файл *',
        type: 'file',
        accept: '.doc, .pdf, .png, .jpg, .xls, ai, .mpg, .mp4, .rar, jpeg',
        hint: 'Вес данных не должен превышать 200мб',
        control: 'file',
        maxSize: this.fileMaxSize,
      },
      {
        label: 'Навигация *',
        type: 'file',
        accept: '.png, .jpg, jpeg',
        hint: 'Месторасположение – скан карты с расположением метки',
        control: 'navigation',
        maxSize: this.navigationMaxSize,
      },
      {
        label: 'Номер телефона',
        type: 'phone',
        control: 'phone',
      },
      {
        label: 'Email',
        control: 'email',
      },
    ];
  }

  get controls() {
    return this.form.controls;
  }

  get chronologyList(): number[] {
    const list = [];
    let cur = 1950;
    while (cur < 2020) {
      list.push(cur);
      cur += 10;
    }
    return list;
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.form.valid) {
      const formData = new FormData();
      const data = this.form.getRawValue();
      const titles = this.prepareLabels();

      for (const key in data) {
        let value = data[key];
        if (typeof data[key] !== 'object') {
          value = `${titles[key]}: ${data[key]}`;
        }
        formData.append(key, value);
      }
      this.openDialog();
      this.http
        .post('https://nodemailer-ser.herokuapp.com/api/email', formData)
        .pipe(
          take(1),
          catchError((error) => {
            const options: MatSnackBarConfig<any> = {
              panelClass: 'error',
              horizontalPosition: 'center',
              verticalPosition: 'top',
            };
            const title = 'Ошибка';
            this.openSnackBar(title, options);
            return of(error);
          }),
          finalize(() => {
            this.closeDialog();
          })
        )
        .subscribe((res: any) => {
          const title = 'Принято к рассмотрению!';
          const options: MatSnackBarConfig<any> = {
            panelClass: 'success',
            horizontalPosition: 'center',
            verticalPosition: 'top',
          };
          if (res.success) {
            this.form.reset();
            this.openSnackBar(title, options);
          }
        });
    }
  }

  private prepareLabels(): any {
    const labels: any = {};
    this.options.forEach((option) => {
      labels[option.control] = option.label;
    });
    return labels;
  }

  private openDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }
  private closeDialog(): void {
    this.dialog.closeAll();
  }

  private openSnackBar(title: string, options: MatSnackBarConfig<any>): void {
    this._snackBar.open(title, 'Закрыть', options);
  }
}
