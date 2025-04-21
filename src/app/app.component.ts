import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

declare global {
  interface Window {
    electronAPI: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'e-Liquid_Calculator';

  amount: any = 100;

  selectedReceipt: any = null;

  allRecipes: any = [];

  references = {
    pg: 1.04,
    vg: 1.26,
    flavor: 1.04,
  };

  pg: number = 50;
  vg: number = 50;
  ripening: any;
  dateOfProducing: Date = new Date();
  notes: string = '';
  description: string = '';

  nicTarget: number = 6;
  nicStrength: number = 20;

  userFlavors: any = [];
  flavors: any = [];
  edit: boolean = false;
  itemToEdit: number | undefined;

  nikBase: any = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    window.electronAPI.onAromaImport((data: any) => {
      console.log('Importierte Aromen:', data);
      this.flavors = data;
      this.cdr.detectChanges();
    });
    window.electronAPI.onRecipesLoaded((recipes: any) => {
      console.log('Rezepte vom Main-Prozess empfangen:', recipes);

      // Du kannst sie z. B. in eine Variable speichern:
      this.allRecipes = recipes;
      this.cdr.detectChanges();
    });
  }

  onPgChange1(): void {
    this.pg = Math.min(100, Math.max(0, this.pg ?? 0));
    this.vg = 100 - this.pg;
  }

  onVgChange1(): void {
    this.vg = Math.min(100, Math.max(0, this.vg ?? 0));
    this.pg = 100 - this.vg;
  }

  pgNic: number = 50;
  vgNic: number = 50;

  onPgChange2(): void {
    this.pgNic = Math.min(100, Math.max(0, this.pgNic ?? 0));
    this.vgNic = 100 - this.pgNic;
  }

  onVgChange2(): void {
    this.vgNic = Math.min(100, Math.max(0, this.vgNic ?? 0));
    this.pgNic = 100 - this.vgNic;
  }

  addFlavor() {
    this.userFlavors.push({
      name: this.flavors[0], // <-- Hier Standardwert setzen
      percent: 0,
      mg: 0,
      ml: 0,
    });
    this.edit = true;
  }

  onChangeFlavor(idx: number) {
    this.userFlavors[idx].ml = (
      (this.amount * this.userFlavors[idx].percent) /
      100
    ).toFixed(2);

    this.userFlavors[idx].mg = (
      this.userFlavors[idx].ml * this.references.flavor
    ).toFixed(2);
  }

  getAmountOfAllFlavors(): number {
    return this.userFlavors.reduce(
      (sum: number, f: any) => sum + (+f.ml || 0),
      0
    );
  }

  save() {
    this.edit = false;
    this.itemToEdit = undefined;
  }

  edititem(idx: number) {
    this.itemToEdit = idx;
    this.edit = false;
  }

  deleteItem(idx: number) {
    this.userFlavors.splice(idx, 1);
    this.cdr.detectChanges();
  }

  newReceipt() {
    this.selectedReceipt = null;

    this.description = '';
    this.nicTarget = 20;
    this.nicStrength = 6;
    this.pgNic = 50;
    this.vgNic = 50;
    this.amount = 100;
    this.dateOfProducing = new Date();
    this.notes = '';
    this.userFlavors = [];
    this.pg = 50;
    this.vg = 50;
    this.ripening = null;
  }

  generateId(length: number = 20): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    array.forEach((n) => (result += chars[n % chars.length]));
    return result;
  }

  saveReceipt() {
    const receipt = {
      description: this.description,
      amount: this.amount,
      ripening: this.ripening,
      dateOfProducing: this.dateOfProducing,
      notes: this.notes,
      pg: this.pg,
      vg: this.vg,
      nicotin: {
        pg: this.pgNic,
        vg: this.vgNic,
        target: this.nicTarget,
        strength: this.nicStrength,
      },
      Ingredients: this.userFlavors,
      id: this.selectedReceipt?.id || this.generateId(), //  entweder bestehende ID oder neue
    };

    const existingIndex = this.allRecipes.findIndex(
      (r: any) => r.id === receipt.id
    );

    if (existingIndex !== -1) {
      // Rezept mit gleicher ID existiert
      this.allRecipes[existingIndex] = receipt;
      console.log('Rezept aktualisiert:', receipt);
    } else {
      // Neues Rezept
      this.allRecipes.push(receipt);
      console.log('Neues Rezept gespeichert:', receipt);
    }

    window.electronAPI.saveRecipe(this.allRecipes);
  }

  getPG(unit: any = null) {
    const pg =
      (this.amount * this.pg - this.nikBase * this.pgNic) / 100 -
      this.getAmountOfAllFlavors();
    if (unit == 'ml') return pg.toFixed(2);
    return (pg * this.references.pg).toFixed(2);
  }

  getVG(unit: any = null) {
    const vg = (this.amount * this.vg - this.nikBase * this.vgNic) / 100;
    if (unit == 'ml') return vg.toFixed(2);
    return (vg * this.references.vg).toFixed(2);
  }

  getNik(unit: any = null) {
    this.nikBase = this.amount / (this.nicStrength / this.nicTarget);
    if (unit == 'ml') {
      return this.nikBase.toFixed(2);
    }
    return (
      (this.nikBase *
        (this.vgNic * this.references.vg + this.pgNic * this.references.pg)) /
      100
    ).toFixed(2);
  }

  onChangeReceipt() {
    console.log('Ausgewähltes Rezept:', this.selectedReceipt);

    this.description = this.selectedReceipt.description;
    this.nicTarget = this.selectedReceipt.nicotin.target;
    this.nicStrength = this.selectedReceipt.nicotin.strength;
    this.pgNic = this.selectedReceipt.nicotin.pg;
    this.vgNic = this.selectedReceipt.nicotin.vg;
    this.amount = this.selectedReceipt.amount;
    this.dateOfProducing = this.selectedReceipt.dateOfProducing;
    this.notes = this.selectedReceipt.notes;
    this.userFlavors = this.selectedReceipt.Ingredients;
    this.pg = this.selectedReceipt.pg;
    this.vg = this.selectedReceipt.vg;
    this.ripening = this.selectedReceipt.ripening;

    this.cdr.detectChanges();
  }
}
