import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, catchError, finalize, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogComponent } from './components/dialog/dialog.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { IOption, ISelect } from './interfaces';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly select: string = 'select';

  currentLanguage!: string;
  readonly languages: ISelect[] = [
    {
      label: 'Русский',
      value: 'ru',
    },
    {
      label: ' O’zbekcha ',
      value: 'uz',
    },
  ];

  private readonly fileType: string[] = [
    'FILE_TYPE.IMG',
    'FILE_TYPE.TEXT',
    'FILE_TYPE.AUDIO',
    'FILE_TYPE.VIDEO',
    'FILE_TYPE.DIAGRAM',
    'FILE_TYPE.MAP_SCHEME',
    'FILE_TYPE.TABLE',
    'FILE_TYPE.LINK',
  ];

  private readonly layerTheme: string[] = [
    'LAYER_THEME.REGION',
    'LAYER_THEME.DISTRICT',
    'LAYER_THEME.POPULATION_CENTERS',
    'LAYER_THEME.INDUSTRY',
    'LAYER_THEME.AGRICULTURE',
    'LAYER_THEME.POWERHOUSE',
    'LAYER_THEME.SCIENCE_CULTURE',
  ];

  readonly fileMaxSize = 200 * 2 ** 20;
  readonly navigationMaxSize = 10 * 2 ** 20;

  private _destroy$ = new Subject<boolean>();

  options: IOption[];
  form: FormGroup;
  constructor(
    private readonly fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private translate: TranslateService
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
        label: 'OPTIONS.FIO',
        hint: '',
        type: '',
        control: 'fio',
      },
      {
        label: 'OPTIONS.WORK',
        hint: 'OPTIONS.WORK_HINT',
        control: 'work',
      },
      {
        label: 'OPTIONS.POSITION',
        hint: 'OPTIONS.POSITION_HINT',
        type: '',
        control: 'position',
      },
      {
        label: 'OPTIONS.LAYER_THEME',
        type: this.select,
        list: this.layerTheme,
        control: 'layerTheme',
      },
      {
        label: 'OPTIONS.CHRONOLOGY',
        type: this.select,
        control: 'chronology',
        list: this.chronologyList,
      },
      {
        label: 'OPTIONS.FILE_TYPE',
        type: this.select,
        control: 'fileType',
        list: this.fileType,
      },
      {
        label: 'OPTIONS.FILE',
        type: 'file',
        accept: '.doc, .pdf, .png, .jpg, .xls, ai, .mpg, .mp4, .rar, jpeg',
        hint: 'OPTIONS.FILE_HINT',
        control: 'file',
        maxSize: this.fileMaxSize,
      },
      {
        label: 'OPTIONS.NAVIGATION',
        type: 'file',
        accept: '.png, .jpg, jpeg',
        control: 'navigation',
        maxSize: this.navigationMaxSize,
      },
      {
        label: 'OPTIONS.PHONE',
        type: 'phone',
        control: 'phone',
      },
      {
        label: 'OPTIONS.EMAIL',
        control: 'email',
      },
    ];
  }

  ngOnInit(): void {
    this.prepareLanguage();
    this.prepareForm();

    this.form.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((value) => {
        const { navigation, file, ...data } = value;
        localStorage.setItem('formData', JSON.stringify(data));
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  private prepareLanguage(): void {
    const lang = localStorage.getItem('lang') || 'ru';
    this.translate.setDefaultLang(lang);
    this.currentLanguage = this.translate.defaultLang;
  }

  private prepareForm(): void {
    const formData = localStorage.getItem('formData');
    if (formData) {
      this.form.patchValue(JSON.parse(formData));
    }
  }

  get controls() {
    return this.form.controls;
  }

  get chronologyList(): string[] {
    const list = [];
    let cur = 1950;
    while (cur < 1990) {
      const value = cur + '';
      list.push(value);
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
        let value: string | Blob = data[key];
        if (typeof data[key] !== 'object') {
          const label: string = this.translate.instant(titles[key]);
          const userValue = this.translate.instant(data[key]);
          value = `${label}: ${userValue}`;
        }
        formData.append(key, value);
      }
      this.openDialog();
      this.http
        .post('https://nodemailer-ser.herokuapp.com/api/email', formData)
        .pipe(
          takeUntil(this._destroy$),
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
          const title = this.translate.instant('ACCEPTED');
          const options: MatSnackBarConfig<any> = {
            panelClass: 'success',
            horizontalPosition: 'center',
            verticalPosition: 'top',
          };
          if (res.success) {
            this.form.reset();
            localStorage.removeItem('formData');
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
    dialogRef.afterClosed().pipe(takeUntil(this._destroy$)).subscribe();
  }
  private closeDialog(): void {
    this.dialog.closeAll();
  }

  private openSnackBar(title: string, options: MatSnackBarConfig<any>): void {
    const actionText = this.translate.instant('CLOSE');
    this._snackBar.open(title, actionText, options);
  }

  setLanguage({ value }: ISelect): void {
    this.translate.use(value);
    this.currentLanguage = value;
    localStorage.setItem('lang', value);
  }
}
