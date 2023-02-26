import {NgModule, Type} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TokenParamGuard} from "@core/guard";
import {StatusComponent} from "@ng/components/status/status.component";

export const routes: Routes = [
  {
    path: '',
    canActivate: [TokenParamGuard],
    loadChildren: (): Promise<Type<any>> =>
      import('./modules/main/main.module').then((m) => m.MainModule),
  },
  {
    path: '404',
    component: StatusComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      useHash: true
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
