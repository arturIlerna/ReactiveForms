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
  bookingForm!: FormGroup;
  searchControl = new FormControl(''); // Filtre independent
  destinations = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Mallorca'];
  filteredDestinations = [...this.destinations];
  totalPrice = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.setupSearch();
    this.setupPriceAndPassengerSync();
  }

  initForm() {
    this.bookingForm = this.fb.group({
      // 1. Dades del Client
      fullName: ['', [Validators.required, Validators.minLength(3), CustomValidators.nameValidator]],
      dniNie: ['', [Validators.required, CustomValidators.dniNieValidator]],
      email: ['', [Validators.required, Validators.email], [CustomValidators.emailExists]],
      phone: ['', [Validators.required, CustomValidators.phoneValidator]],
      birthDate: ['', [Validators.required, CustomValidators.ageValidator]],
      
      // 2. Informacio del Viatge
      destination: ['', Validators.required],
      departureDate: ['', [Validators.required, CustomValidators.futureDateValidator]],
      returnDate: ['', Validators.required],
      tripType: ['anada', Validators.required],
      travelClass: ['turista', Validators.required],
      passengersCount: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      additionalPassengers: this.fb.array([]), // FormArray
      
      // 3. Condicions
      terms: [false, Validators.requiredTrue],
      newsletter: [false]
    }, { validators: CustomValidators.dateRangeValidator });
  }

  setupSearch() {
    // Filtre de cerca en temps real
    this.searchControl.valueChanges.subscribe(val => {
      const filterValue = val?.toLowerCase() || '';
      this.filteredDestinations = this.destinations.filter(d => 
        d.toLowerCase().includes(filterValue)
      );
    });
  }

  setupPriceAndPassengerSync() {
    // Ajustar FormArray segons nombre de passatgers
    this.bookingForm.get('passengersCount')?.valueChanges.subscribe(num => {
      this.adjustAdditionalPassengers(num);
      this.calculatePrice();
    });

    // Recalcular preu quan canvia qualsevol valor rellevant
    this.bookingForm.valueChanges.subscribe(() => this.calculatePrice());
  }

  get additionalPassengers() {
    return this.bookingForm.get('additionalPassengers') as FormArray;
  }

  adjustAdditionalPassengers(total: number) {
    const extraNeeded = total - 1;
    while (this.additionalPassengers.length < extraNeeded) {
      this.additionalPassengers.push(this.fb.group({
        nom: ['', Validators.required],
        edat: ['', [Validators.required, Validators.min(0)]],
        relacio: ['', Validators.required]
      }));
    }
    while (this.additionalPassengers.length > extraNeeded) {
      this.additionalPassengers.removeAt(this.additionalPassengers.length - 1);
    }
  }

  calculatePrice() {
    // Preus base: Turista (100), Business (250), Primera (500)
    const prices: { [key: string]: number } = { 'turista': 100, 'business': 250, 'primera': 500 };
    const base = prices[this.bookingForm.get('travelClass')?.value] || 0;
    const qty = this.bookingForm.get('passengersCount')?.value || 1;
    this.totalPrice = base * qty;
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      console.log('Dades del formulari:', this.bookingForm.value);
    }
  }
}