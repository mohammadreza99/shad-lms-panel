import {Component, OnInit} from '@angular/core';
import {OverlayService} from "@ng/services";
import {AuthService, DataService} from "@core/http";
import {User} from "@core/models";

@Component({
  selector: 'ng-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  user: User;

  constructor(private overlayService: OverlayService,
              private authService: AuthService,
              private dataService: DataService) {
  }

  ngOnInit(): void {
    this.user = this.dataService.user;
  }

  async logout() {
    const dialogRes = await this.overlayService.showConfirmDialog({
      header: 'هشدار',
      message: 'آیا از خروج سایت اطمینان دارید؟',
      closable: false
    })
    if (dialogRes) {
      await this.authService.logout();
    }
  }
}
