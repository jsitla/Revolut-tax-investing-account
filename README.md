# 🇸🇮 Revolut → FURS Poročanje

**Enostavno orodje za pretvorbo Revolut izpiskov v XML format za eDavke.**

👉 **[Uporabi aplikacijo](https://revolut-furs.vercel.app)** *(če je deplojano)* ali zaženi lokalno.

---

## 🚀 Funkcionalnosti

- **Povsem zasebno**: Vsi podatki se obdelajo **lokalno v vašem brskalniku**. Nobeni podatki se ne pošiljajo na strežnik.
- **Drag & Drop**: Preprosto povleci CSV datoteko.
- **Doh-KDVP**: Avtomatsko generiranje XML datoteke za prijavo dobička od odsvojitve vrednostnih papirjev.
- **Doh-Div**: Avtomatsko generiranje XML datoteke za prijavo dividend.
- **Pregledna vizualizacija**: Trenutni pregled dobičkov, davkov in transakcij pred izvozom.

## 📋 Navodila za uporabo

### 1. Priprava podatkov (Revolut)

1. Odpri aplikacijo Revolut na telefonu ali spletu.
2. Pojdi na **Invest** (Delnice).
3. Klikni **More (...)** -> **Documents** -> **Stocks** -> **Trading Statement**.
4. Izberi časovno obdobje (npr. `01/01/2024` - `31/12/2024`).
5. Izberi format **Excel/CSV** (ne PDF!).
6. Shrani datoteko na računalnik.

### 2. Uporaba aplikacije

1. Odpri [Revolut FURS Poročanje](http://localhost:5173).
2. Povleci shranjeno CSV datoteko v označeno polje.
3. Preveri podatke v tabeli in povzetku.
4. Klikni **Prenesi KDVP XML** za kapitalske dobičke.
5. Klikni **Prenesi Dividende XML** za dividende.

### 3. Oddaja na eDavki

1. Prijavi se v portal [eDavki](https://edavki.durs.si/).
2. Izberi **Uvoz dokumenta**.
3. Naloži generirani XML datoteki.
4. Preveri uvožene podatke in oddaj vlogo.

---

## ⚠️ Omejitve in Pogoji

- **Naložbeni račun**: Podprt je "Trading Statement" format. "Account Statement" morda ne vsebuje vseh potrebnih podatkov.
- **Valute**: Aplikacija predvideva, da so poročila v EUR ali USD. FURS zahteva konverzijo v EUR (če ni avtomatsko, preveri tečaje). *Opomba: Trenutna verzija uporablja vrednosti, kot so v CSV-ju.*
- **Točnost**: Avtor ne odgovarja za pravilnost izračunov. Vedno preverite podatke pred oddajo!

## 🛠️ Tehnične podrobnosti

Projekt je zgrajen z:
- React + TypeScript
- Vite
- Tailwind CSS
- Papa Parse (CSV parsing)

### Lokalni zagon

```bash
# Namesti odvisnosti
npm install

# Zaženi razvojni strežnik
npm run dev

# Zgradi za produkcijo
npm run build
```

---

*Made with ❤️ for crypto & stock traders.*
