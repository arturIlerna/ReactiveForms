import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export class CustomValidators {
  // Validador de Nom (nomes lletres i espais)
  static nameValidator(control: AbstractControl): ValidationErrors | null {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return nameRegex.test(control.value) ? null : { invalidName: true };
  }

  // Validador de Telefon Espanyol (9 digits, comencen per 6, 7 o 9)
  static phoneValidator(control: AbstractControl): ValidationErrors | null {
    const phoneRegex = /^[679]\d{8}$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  }

  // Validador de DNI/NIE espanyol
  static dniNieValidator(control: AbstractControl): ValidationErrors | null {
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    return dniRegex.test(control.value) ? null : { invalidDni: true };
  }

  // Validador d'Edat Minima (major de 18)
  static ageValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age >= 18 ? null : { underAge: true };
  }

  // Validador de Data Futura
  static futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(control.value);
    return inputDate > today ? null : { notFuture: true };
  }

  // Validador Asincrona d'Email
  static emailExists(control: AbstractControl): Observable<ValidationErrors | null> {
    const existingEmails = ['test@test.com', 'reserva@viajes.com', 'admin@travel.com'];
    return of(existingEmails.includes(control.value)).pipe(
      delay(1000), // Simular delay de 1 segon
      map(exists => (exists ? { emailTaken: true } : null))
    );
  }

  // Validador Creuada de Dates
  static dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('departureDate')?.value;
    const end = group.get('returnDate')?.value;
    return start && end && new Date(end) > new Date(start) ? null : { invalidRange: true };
  };
}