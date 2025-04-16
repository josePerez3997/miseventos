import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  toggleMobileMenu = false;
  userName = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn;

    if (this.isLoggedIn && this.authService.currentUser) {
      this.userName = this.authService.currentUser.name;
    }

    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userName = user ? user.name : '';
    });
  }

  logout(): void {
    this.authService.logout();
  }
}