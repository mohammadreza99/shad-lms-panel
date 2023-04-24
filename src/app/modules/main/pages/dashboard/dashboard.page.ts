import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {DataService} from "@core/http";
import {FormControl, FormGroup} from "@angular/forms";
import {MomentService, UtilsService} from "@ng/services";
import {CountBar, District, ExamCount, Item, Province, TutorialCount, Usage} from "@core/models";
import {ProvincesComponent} from "@modules/main/components/provinces/provinces.component";

@Component({
  selector: 'ng-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  @ViewChildren(ProvincesComponent) provincesCmps: QueryList<ProvincesComponent>;
  countBarForm = new FormGroup({
    field: new FormControl(),
    grade: new FormControl(),
    gender_id: new FormControl(),
    province_id: new FormControl(),
    district_id: new FormControl(),
    start_time: new FormControl(),
    end_time: new FormControl(),
  }, this.bothDatesValidator);
  usageForm = new FormGroup({
    school_gender: new FormControl(),
    province_id: new FormControl(),
    district_id: new FormControl(),
    school_type: new FormControl(),
    grade: new FormControl(),
    school_id: new FormControl(),
  });
  countBar: CountBar = {};
  usage: Usage = {};
  fields: Item[] = [];
  grades: Item[] = [];
  examCount: ExamCount = {};
  homeworkCount: ExamCount = {};
  tutorialCount: TutorialCount = {};
  countBarFilterEnabled: boolean = false;
  usageFilterEnabled: boolean = false;
  schoolTypes = this.dataService.schoolTypes;
  genders = this.dataService.genders;
  schoolGenders = this.dataService.schoolGenders;
  mapValue: string;

  constructor(private dataService: DataService,
              private momentService: MomentService,
              private utilsService: UtilsService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    this.countBar = await this.dataService.getCountBar();
    this.usage = await this.dataService.getUsage();
    this.examCount = await this.dataService.getExamCount();
    this.homeworkCount = await this.dataService.getHomeworkCount();
    this.tutorialCount = await this.dataService.getTutorialCount();
    this.fields = await this.dataService.getFields();
    this.grades = await this.dataService.getGrades();
  }

  async onSubmitCountBarFilter() {
    const filters: any = this.utilsService.getDirtyControls(this.countBarForm);
    if (!filters) {
      return;
    }
    let {start_time, end_time} = filters;
    if (start_time && end_time) {
      filters.start_time = this.momentService.getIsoDateWithoutTimeZone(start_time.toDate()).split('.')[0];
      filters.end_time = this.momentService.getIsoDateWithoutTimeZone(end_time.toDate()).split('.')[0];
    }
    this.countBar = await this.dataService.getCountBar(filters)
    this.countBarFilterEnabled = true;
  }

  async clearCountBarFilter() {
    this.countBar = await this.dataService.getCountBar();
    this.countBarForm.reset();
    this.countBarFilterEnabled = false;
  }

  async onSubmitUsageFilter() {
    const filters = this.utilsService.getDirtyControls(this.usageForm);
    if (!filters) {
      return;
    }
    this.usage = await this.dataService.getUsage(filters)
    this.usageFilterEnabled = true;
  }

  async clearUsageFilter() {
    this.usage = await this.dataService.getUsage()
    this.usageForm.reset();
    this.usageFilterEnabled = false;
    this.mapValue = null;
  }

  bothDatesValidator(group: FormGroup) {
    const start_time = group.get('start_time').value;
    const end_time = group.get('end_time').value;
    const bothFilled = !!start_time && !!end_time;
    const bothEmpty = !start_time && !end_time;
    return (bothFilled || bothEmpty) ? null : {invalidDate: true};
  }

  async onMapClick(event: any) {
    const {value, loadingCallback} = event;
    this.usageForm.get('province_id').setValue(value.toString());
    this.usageForm.get('province_id').markAsDirty();
    try {
      await this.provincesCmps.toArray()[1]._onProvinceChange({value: value.toString()});
      await this.onSubmitUsageFilter();
      loadingCallback()
    } catch {
      loadingCallback()
    }
  }

  onUsageProvinceChange(event: any) {
    this.mapValue = event;
  }
}
