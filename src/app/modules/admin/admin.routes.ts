import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { ProductsComponent } from './pages/products/products.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { PeopleComponent } from './pages/people/people.component';
import { SaleComponent } from './pages/sale/sale.component';
import { MyCompaniesComponent } from './pages/my-companies/my-companies.component';
import { SaleReportViewComponent } from './pages/reports/sale-report-view/sale-report-view.component';
import { HelperComponent } from './pages/helper/helper.component';
import { ChartsComponent } from './pages/charts/charts.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'shopping-cart',
    component: ShoppingCartComponent
  },
  {
    path: 'products',
    component: ProductsComponent
  },
  {
    path: 'my-profile',
    component: MyProfileComponent
  },
  {
    path: 'people',
    component: PeopleComponent
  },
  {
    path: 'sale',
    component: SaleComponent
  },
  {
    path: 'my-companies',
    component: MyCompaniesComponent
  },
  {
    path: 'sale-report-view/:id',
    component: SaleReportViewComponent
  },
  {
    path: 'helper',
    component: HelperComponent
  },
  {
    path: 'charts',
    component: ChartsComponent
  }
];
