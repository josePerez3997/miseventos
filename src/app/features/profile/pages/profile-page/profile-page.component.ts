import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../auth/services/auth.service';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
    standalone: true,
    imports: [CommonModule]
})
export class ProfilePageComponent implements OnInit {
    user: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit() {
        this.user = this.authService.currentUser;

        this.authService.currentUser$.subscribe(user => {
            this.user = user;
        });
    }
}