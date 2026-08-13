import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../topbar/topbar';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Topbar, Navbar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {}