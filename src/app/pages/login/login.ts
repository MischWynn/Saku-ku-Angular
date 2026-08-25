// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { RouterLink } from '@angular/router';
// import { 
//   LucideAngularModule, 
//   Mail, 
//   Lock, 
//   Eye, 
//   EyeOff, 
//   ArrowRight, 
//   MessageCircleQuestion, 
//   Layers 
// } from 'lucide-angular';


// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
//   templateUrl: './login.html', 
//   styleUrls: ['./login.css']
// })
// export class LoginComponent {
//   loginForm: FormGroup;
//   showPassword = false;

//   readonly Mail = Mail;
//   readonly Lock = Lock;
//   readonly Eye = Eye;
//   readonly EyeOff = EyeOff;
//   readonly ArrowRight = ArrowRight;
//   readonly MessageCircleQuestion = MessageCircleQuestion;
//   readonly Layers = Layers;

//   constructor(private fb: FormBuilder) {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required]]
//     });
//   }

//   togglePasswordVisibility(): void {
//     this.showPassword = !this.showPassword;
//   }

//   onSubmit(): void {
//     if (this.loginForm.valid) {
//       console.log('Login Payload:', this.loginForm.value);
//     }
//   }
// }

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  LucideAngularModule, 
  WalletCards, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight 
} from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  showPassword = signal(false);
  loginForm: FormGroup;

  // Icon Lucide
  readonly WalletIcon = WalletCards;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly ArrowRightIcon = ArrowRight;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword.update(show => !show);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login Payload:', this.loginForm.value);
    }
  }
}