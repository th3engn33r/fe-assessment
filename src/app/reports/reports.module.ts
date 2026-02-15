import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ReportDailyComponent } from './report-daily/report-daily.component';
import { ReportWeeklyComponent } from './report-weekly/report-weekly.component';
import { ReportMonthlyComponent } from './report-monthly/report-monthly.component';
import { ReportQuarterlyComponent } from './report-quarterly/report-quarterly.component';
import { ReportYearlyComponent } from './report-yearly/report-yearly.component';
import { ReportCustomComponent } from './report-custom/report-custom.component';

const routes: Routes = [
  { path: '', redirectTo: 'daily', pathMatch: 'full' },
  { path: 'daily', component: ReportDailyComponent },
  { path: 'weekly', component: ReportWeeklyComponent },
  { path: 'monthly', component: ReportMonthlyComponent },
  { path: 'quarterly', component: ReportQuarterlyComponent },
  { path: 'yearly', component: ReportYearlyComponent },
  { path: 'custom', component: ReportCustomComponent }
];

@NgModule({
  declarations: [
    ReportDailyComponent,
    ReportWeeklyComponent,
    ReportMonthlyComponent,
    ReportQuarterlyComponent,
    ReportYearlyComponent,
    ReportCustomComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ReportsModule {}
