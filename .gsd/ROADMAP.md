# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 MVP

## Must-Haves (from SPEC)
- [ ] CSV upload & parsing (Trading Statement format)
- [ ] Filtriranje po davčnem letu
- [ ] Prikaz povzetka (število transakcij, vsote)
- [ ] XML izvoz za Doh-KDVP (kapitalski dobički)
- [ ] XML izvoz za Doh-Div (dividende)
- [ ] Pregled podatkov pred izvozom (tabela)

## Phases

### Phase 1: Project Setup & Foundation
**Status**: ✅ Done
**Objective**: Postavitev razvojnega okolja z React + Vite + Tailwind CSS
**Deliverables**:
- Inicializiran Vite projekt z React in TypeScript
- Konfiguriran Tailwind CSS
- Osnovna struktura map (components, utils, types)
- Nameščene odvisnosti (Papa Parse, file-saver)

---

### Phase 2: CSV Parsing & Data Model
**Status**: ⬜ Not Started
**Objective**: Implementacija parsiranja Revolut Trading Statement CSV
**Deliverables**:
- TypeScript tipi za transakcije (Sale, Dividend)
- Parser za "Income from Sells" sekcijo
- Parser za "Other income & fees" sekcijo
- Filtriranje po letu
- Unit testi za parser

---

### Phase 3: UI Implementation
**Status**: ⬜ Not Started
**Objective**: Implementacija uporabniškega vmesnika
**Deliverables**:
- Komponenta za upload datoteke (drag & drop)
- Izbira leta
- Prikaz povzetka (število prodaj, dobički, dividende)
- Tabela s pregledom podatkov
- Gumbi za izvoz XML

---

### Phase 4: XML Generation
**Status**: ⬜ Not Started
**Objective**: Generiranje FURS-kompatibilnih XML datotek
**Deliverables**:
- Generator za Doh-KDVP XML (kapitalski dobički)
- Generator za Doh-Div XML (dividende)
- Grupiranje po ISIN za KDVP
- Download funkcionalnost

---

### Phase 5: Testing & Polish
**Status**: ⬜ Not Started
**Objective**: Testiranje z realnimi podatki in končni popravki
**Deliverables**:
- Test z vzorčnimi Revolut CSV datotekami
- Validacija XML proti FURS zahtevam
- Navodila za uporabo v UI
- Deployment na Vercel/Netlify
