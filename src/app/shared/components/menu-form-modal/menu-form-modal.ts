import { Component, computed, input, output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { Menu, MenuRequest, MenuStatus } from '../../models/menu.model';

@Component({
  selector: 'app-menu-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideX],
  templateUrl: './menu-form-modal.html',
  styleUrl: './menu-form-modal.css',
})
export class MenuFormModalComponent implements OnChanges {
  readonly menu = input<Menu | null>(null);
  readonly menuOptions = input<Menu[]>([]);
  readonly submitting = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly close = output<void>();
  readonly submitForm = output<MenuRequest>();

  protected readonly isEditMode = computed(() => !!this.menu());
  protected readonly title = computed(() => (this.isEditMode() ? 'Edit Menu' : 'Tambah Menu'));

  // Menu gak boleh jadi parent-nya diri sendiri
  protected readonly parentOptions = computed(() =>
    this.menuOptions().filter((m) => m.id !== this.menu()?.id)
  );

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.nonNullable.group({
    namaMenu: ['', Validators.required],
    path: [''],
    icon: [''],
    parentId: [''],
    urutan: [0],
    status: ['ACTIVE' as MenuStatus],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ('menu' in changes) {
      const menu = this.menu();
      this.form.reset({
        namaMenu: menu?.namaMenu ?? '',
        path: menu?.path ?? '',
        icon: menu?.icon ?? '',
        parentId: menu?.parentId ?? '',
        urutan: menu?.urutan ?? 0,
        status: menu?.status ?? 'ACTIVE',
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitForm.emit({
      namaMenu: value.namaMenu,
      path: value.path,
      icon: value.icon,
      parentId: value.parentId || null,
      urutan: value.urutan,
      status: value.status,
    });
  }
}
