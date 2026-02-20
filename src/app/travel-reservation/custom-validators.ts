import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export class CustomValidators {
  
  /**
   * Validador de Nom
   * Comprova que el text tingui només lletres, amb accents, la ñ i espais.
   */
  static nameValidator(control: AbstractControl): ValidationErrors | null {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    // Si el valor passa el regex, retornem null, si no, retornem l'error 'invalidName'.
    return nameRegex.test(control.value) ? null : { invalidName: true };
  }

  /**
   * Validador Telf
   * Valida que el número tingui 9 digits i comenci per 6, 7 o 9.
   */
  static phoneValidator(control: AbstractControl): ValidationErrors | null {
    const phoneRegex = /^[679]\d{8}$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  }

  /**
   * Validador de DNI/NIE
   * Segueix el format de 8 números + lletra (DNI) o lletra X/Y/Z + 7 números + lletra (NIE).
   */
  static dniNieValidator(control: AbstractControl): ValidationErrors | null {
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    return dniRegex.test(control.value) ? null : { invalidDni: true };
  }

  /**
   * Validador d'Edat Mínima
   * Calcula si l'usuari té 18 anys o més comparant la data de naixement amb la data actual.
   * Té en compte el dia i el mes.
   */
  static ageValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // Si no hi ha valor, no validem encara.
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    // Si encara no ha arribat el seu mes o el seu dia d'aniversari aquest any, restem un any.
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age >= 18 ? null : { underAge: true };
  }

  /**
   * Validador de Data Futura
   * Assegura que la data de sortida sigui posterior al dia d'avui.
   * Reseteja les hores a zero per comparar només els dies.
   */
  static futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorem l'hora actual per a la comparació.
    const inputDate = new Date(control.value);
    return inputDate > today ? null : { notFuture: true };
  }

  /**
   * Validador Asíncron d'Email, basicament es fa servir per comprovar si un email ja está registrat. 
   * Simula una consulta a una base de dades.
   * L'estat del camp serà 'PENDING' mentre s'executa.
   */
  static emailExists(control: AbstractControl): Observable<ValidationErrors | null> {
    const existingEmails = ['test@test.com', 'reserva@viajes.com', 'admin@travel.com'];
    return of(existingEmails.includes(control.value)).pipe(
      delay(1000), // Simulem espera paran el flux de dades durant el temps demanat. 
      map(exists => (exists ? { emailTaken: true } : null)) // El map agafa el resultat booleà i el mapeja al format que Angular enten.
      // Si existeix envia el error, en cas contrari retorna null. 
    );
  }

  /**
   * Validador Creuat de Dates
   * FormGroup complet per comparar dos camps alhora: sortida i retorn.
   * El retorn ha de ser posterior a la sortida.
   */
  static dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('departureDate')?.value;
    const end = group.get('returnDate')?.value;
    // Si estan les dos dates, comprovem que el retorn sigui posterior a la sortida.
    return start && end && new Date(end) > new Date(start) ? null : { invalidRange: true };
  };
}