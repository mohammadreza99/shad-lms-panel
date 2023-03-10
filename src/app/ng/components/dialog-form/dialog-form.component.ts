import {Component, ElementRef, EventEmitter} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn} from "@angular/forms";
import {NgDialogFormConfig, NgDialogFormOptions, NgDialogFormResult} from "@ng/models/overlay";
import {NgValidation} from "@ng/models/forms";
import {DomHandler} from "@ng/services";
import {GlobalConfig} from "@core/global.config";

@Component({
  selector: 'ng-dialog-form',
  templateUrl: './dialog-form.component.html',
  styleUrls: ['./dialog-form.component.scss']
})
export class DialogFormComponent {
  constructor(private el: ElementRef) {
  }

  form: FormGroup;
  visible: boolean;
  closeCallback: () => void;
  _config: NgDialogFormConfig[];
  _options: NgDialogFormOptions;
  onSubmit = new EventEmitter<NgDialogFormResult>();
  onClose = new EventEmitter<void>();
  disableReject: boolean;

  set config(value: NgDialogFormConfig[]) {
    this._config = value;
    this.form = new FormGroup({});
    for (const config of this._config) {
      if (!config.labelPos) {
        config.labelPos = GlobalConfig.defaultLabelPos;
      }
      if (!config.fixLabelPos) {
        config.fixLabelPos = GlobalConfig.defaultFixLabelPos;
      }
      if (config.key) {
        this.form.addControl(config.key, new FormControl(null));
        this.handleConfigValue(config);
        this.handleConfigValidations(config);
      }
    }
  }

  set options(v: NgDialogFormOptions) {
    this._options = v;
    if (this._options.formValidator) {
      this.form.setValidators(this.options.formValidator.validator);
    }
  }

  get options() {
    return this._options
  }

  get config() {
    return this._config;
  }

  show() {
    this.visible = true;
  }

  close() {
    this.visible = false;
    if (this.closeCallback) {
      this.closeCallback()
    }
    this.onClose.emit();
  }

  handleConfigValue(config: NgDialogFormConfig) {
    const control = this.form.get(config.key);
    if (config.value != null) {
      control.setValue(config.value);
    }
  }

  convertToComponentValidation(config: NgDialogFormConfig): NgValidation {
    const errObj = {};
    if (!config.validations) {
      return errObj;
    }
    for (const e of config.validations) {
      if (typeof e.message == 'function') {
        const control = this.form.get(config.key);
        errObj[e.type] = e.message(control);
      } else {
        errObj[e.type] = e.message;
      }
    }
    return errObj as NgValidation;
  }

  changeDialogVisibilityTo = (visible: boolean) => {
    this.closeCallback();
    this.visible = visible;
    this.disableReject = false;
    if (!visible) {
      this.close()
    }
  }

  handleConfigEvent(config: NgDialogFormConfig, eventKey: string, eventObj: any) {
    if (config[eventKey]) {
      config[eventKey]({event: eventObj, form: this.form, currentConfig: config, allConfig: this.config});
    }
  }

  handleConfigValidations(config: NgDialogFormConfig) {
    const control = this.form.get(config.key);
    if (config.validations) {
      const validators: ValidatorFn[] = [];
      for (const e of config.validations) {
        validators.push(e.validator);
      }
      control.setValidators([...validators]);
      control.updateValueAndValidity();
    }
  }

  handleConfigVisibility(config: NgDialogFormConfig) {
    let hidden = false;
    if (config.hidden == undefined) {
      return hidden;
    }
    if (typeof config.hidden == 'function') {
      hidden = config.hidden({form: this.form, currentConfig: config, allConfig: this.config});
    } else {
      hidden = config.hidden;
    }
    if (hidden) {
      const control = this.form.get(config.key);
      control?.setValue(null);
      control?.clearValidators();
      control?.updateValueAndValidity();
    } else {
      this.handleConfigValidations(config);
    }
    return hidden;
  }

  handleConfigDisable(config: NgDialogFormConfig) {
    let disabled = false;
    if (config.disabled == undefined) {
      return disabled;
    }
    if (typeof config.disabled == 'function') {
      disabled = config.disabled({form: this.form, currentConfig: config, allConfig: this.config});
    } else {
      disabled = config.disabled;
    }
    if (disabled) {
      const control = this.form.get(config.key);
      control?.clearValidators();
      control?.updateValueAndValidity();
    } else {
      this.handleConfigValidations(config);
    }
    return disabled;
  }

  handleSubmitDisable() {
    let disabled = false;
    if (this.options.submitDisabled == undefined) {
      return disabled;
    }
    if (typeof this.options.submitDisabled == 'function') {
      disabled = this.options.submitDisabled({form: this.form, allConfig: this.config});
    } else {
      disabled = this.options.submitDisabled;
    }
    return disabled;
  }

  setDefaultFocus() {
    let element: HTMLButtonElement;
    switch (this.options.defaultFocus) {
      case 'reject':
        element = DomHandler.findSingle(this.el.nativeElement, '.p-dialog-form-reject');
        break;

      case 'accept':
        element = DomHandler.findSingle(this.el.nativeElement, '.p-dialog-form-accept');
        break;

      case undefined:
        element = null;
        break;
    }
    if (element) {
      element.focus();
    }
  }

  onSubmitClick(closeCallback: any) {
    this.form.markAllAsTouched()
    if (this.form.invalid) {
      closeCallback();
      return;
    }
    this.disableReject = true;
    this.closeCallback = closeCallback;
    this.onSubmit.emit({formValue: this.form.value, changeDialogVisibilityTo: this.changeDialogVisibilityTo})
  }
}
