import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() tabChanged = new EventEmitter<string>();
  activeTab: string = 'dashboard';

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.tabChanged.emit(tab);
  }
}