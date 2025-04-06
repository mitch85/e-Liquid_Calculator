import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'e-Liquid_Calculator';

  pg1: number = 50;
  vg1: number = 50;

  userFlavors: any = [];
  flavors: any = ['Hans', 'Karl', 'Franz'];
  edit: boolean = true;
  itemToEdit: number | undefined;

  onPgChange1(): void {
    this.pg1 = Math.min(100, Math.max(0, this.pg1 ?? 0));
    this.vg1 = 100 - this.pg1;
  }

  onVgChange1(): void {
    this.vg1 = Math.min(100, Math.max(0, this.vg1 ?? 0));
    this.pg1 = 100 - this.vg1;
  }

  pg2: number = 50;
  vg2: number = 50;

  onPgChange2(): void {
    this.pg2 = Math.min(100, Math.max(0, this.pg2 ?? 0));
    this.vg2 = 100 - this.pg2;
  }

  onVgChange2(): void {
    this.vg2 = Math.min(100, Math.max(0, this.vg2 ?? 0));
    this.pg2 = 100 - this.vg2;
  }

  addFlavor() {
    this.userFlavors.push({
      name: this.flavors[0], // <-- Hier Standardwert setzen
      percent: 0,
    });
    this.edit = true;
  }

  save() {
    this.edit = false;
    this.itemToEdit = undefined;
  }

  edititem(idx: number) {
    this.itemToEdit = idx;
    this.edit = false;
  }
}
