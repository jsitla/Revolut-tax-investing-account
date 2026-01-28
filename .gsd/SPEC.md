# SPEC.md — Revolut Furs Poročanje

> **Status**: `FINALIZED`

## Vision
Spletna aplikacija, ki slovenskim uporabnikom Revolut trading platforme omogoča enostavno generiranje letnih davčnih poročil (Doh-KDVP in Doh-Div) za FURS. Aplikacija deluje v celoti v brskalniku (client-side), kar zagotavlja zasebnost podatkov, in pretvori kompleksen CSV izvoz v pripravljene XML datoteke za uvoz v eDavke.

## Goals
1. **Avtomatska pretvorba**: Parsiranje "Trading Statement" CSV izvoza iz Revoluta.
2. **Generiranje XML**: Priprava validnih XML datotek za Doh-KDVP (Kapitalski dobički) in Doh-Div (Dividende).
3. **Uporabniška izkušnja**: Preprost vmesnik "Drag & Drop" brez potrebe po registraciji ali ročnem vnosu podatkov.
4. **Validacija**: Osnovno preverjanje podatkov in filtriranje po davčnem letu.

## Non-Goals (Out of Scope)
- Neposredna oddaja na FURS (zahteva digitalno potrdilo/API access).
- Povezava z Revolut API (ni javno dostopen).
- Podpora za druge borzne posrednike (IBKR, Trading212, eToro itd.) - v tej fazi.
- Shranjevanje podatkov na strežniku (Backend).
- Avtomatska konverzija valut (v MVP fazi se zanašamo na podatke v CSV ali ročan vnos tečaja, če manjka).

## Users
- Slovenski davčni rezidenti.
- Uporabniki Revolut Trading (Stocks).

## Constraints
- **Tehnologija**: Frontend-only (React + Vite).
- **Zasebnost**: Vsi podatki ostanejo v uporabnikovem brskalniku.
- **Rok**: Konec februarja (davčni rok).
- **Format**: XML mora ustrezati FURS XSD shemam.

## Success Criteria
- [ ] Uporabnik lahko generira XML poročila v manj kot 2 minutah.
- [ ] XML datoteke se uspešno uvozijo v portal eDavki brez napak.
- [ ] Aplikacija deluje brez pošiljanja podatkov na zunanji strežnik.
