import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Component({
  selector: 'app-travel-reservation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './travel-reservation.component.html',
  styleUrls: ['./travel-reservation.component.css']
})
export class TravelReservationComponent implements OnInit {
  bookingForm!: FormGroup; // El grup principal del formulari
  searchControl = new FormControl(''); // Control independent per al filtre de cerca
  
  destinations = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Mallorca'];
  filteredDestinations = [...this.destinations]; // Llista que es mostrarà al HTML
  totalPrice = 0; // Variable per emmagatzemar el preu calculat

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm(); // Inicialitzem l'estructura del formulari
    this.setupSearch(); // Activem el buscador reactiu
    this.setupPriceAndPassengerSync(); // Activem la sincronització de preus i passatgers
  }

  /**
   * Defineix tota l'estructura del formulari reactiu.
   * Agrupa validacions de sistema (Angular) i personalitzades.
   */
  initForm() {
    this.bookingForm = this.fb.group({
      // Dades del Client
      fullName: ['', [Validators.required, Validators.minLength(3), CustomValidators.nameValidator]],
      dniNie: ['', [Validators.required, CustomValidators.dniNieValidator]],
      email: ['', [Validators.required, Validators.email], [CustomValidators.emailExists]], // Validador asíncron (3r paràmetre)
      phone: ['', [Validators.required, CustomValidators.phoneValidator]],
      birthDate: ['', [Validators.required, CustomValidators.ageValidator]],
      
      // Informació del Viatge
      destination: ['', Validators.required],
      departureDate: ['', [Validators.required, CustomValidators.futureDateValidator]],
      returnDate: ['', Validators.required],
      tripType: ['anada', Validators.required],
      travelClass: ['turista', Validators.required],
      passengersCount: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      additionalPassengers: this.fb.array([]), // Array dinàmic per a passatgers extra
      
      // Checkboxes obligatoris i opcionals
      terms: [false, Validators.requiredTrue],
      newsletter: [false]
    }, { 
      // Validació creuada per comparar la data d'anada i tornada
      validators: CustomValidators.dateRangeValidator 
    });
  }

  /**
   * Escolta els canvis al camp de cerca i filtra l'array de destinacions.
   */
  setupSearch() {
    this.searchControl.valueChanges.subscribe(val => {
      const filterValue = val?.toLowerCase() || '';
      this.filteredDestinations = this.destinations.filter(d => 
        d.toLowerCase().includes(filterValue)
      );
    });
  }

  /**
   * Gestiona la reactivitat del formulari: 
   * 1. Si canvia el nombre de passatgers, ajusta els camps del FormArray.
   * 2. Si canvia qualsevol dada, torna a calcular el preu.
   */
  setupPriceAndPassengerSync() {
    this.bookingForm.get('passengersCount')?.valueChanges.subscribe(num => {
      this.adjustAdditionalPassengers(num);
      this.calculatePrice();
    });

    // Subscripció global als canvis per actualitzar el preu total
    this.bookingForm.valueChanges.subscribe(() => this.calculatePrice());
  }

  /**
   * Getter per facilitar l'accés al FormArray des del HTML.
   */
  get additionalPassengers() {
    return this.bookingForm.get('additionalPassengers') as FormArray;
  }

  /**
   * Afegeix o elimina grups de camps al FormArray segons el nombre de passatgers triat.
   */
  adjustAdditionalPassengers(total: number) {
    const extraNeeded = total - 1; // El primer passatger és el titular osigui que no va a l'array.
    
    // Si en falten, els creem
    while (this.additionalPassengers.length < extraNeeded) {
      this.additionalPassengers.push(this.fb.group({
        nom: ['', Validators.required],
        edat: ['', [Validators.required, Validators.min(0)]],
        relacio: ['', Validators.required]
      }));
    }
    // Si en sobren, els eliminem per la cua
    while (this.additionalPassengers.length > extraNeeded) {
      this.additionalPassengers.removeAt(this.additionalPassengers.length - 1);
    }
  }

  /**
   * Multiplica el preu base de la classe pel nombre de passatgers.
   */
  calculatePrice() {
    const prices: { [key: string]: number } = { 'turista': 100, 'business': 250, 'primera': 500 };
    const base = prices[this.bookingForm.get('travelClass')?.value] || 0;
    const qty = this.bookingForm.get('passengersCount')?.value || 1;
    this.totalPrice = base * qty;
  }

  /**
   * S'executa en enviar el formulari. Només mostra les dades si tot és vàlid.
   */
  onSubmit() {
    if (this.bookingForm.valid) {
      console.log('Dades del formulari:', this.bookingForm.value);
    }
  }
}