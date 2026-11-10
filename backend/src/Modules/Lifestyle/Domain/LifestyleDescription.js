// US-02: gyvenimo būdo aprašymas laisvu tekstu
// Saugoma users.life_description (varchar(2000))

const MIN_LENGTH = 200;
const MAX_LENGTH = 2000;

// Skaičiuojame simbolius (ne UTF-16 vienetus), kad sutaptų su Postgres varchar ilgiu
const countCharacters = (text) => Array.from(text).length;

class LifestyleDescription {
  constructor(text) {
    this.text = typeof text === "string" ? text.trim() : "";
  }

  get length() {
    return countCharacters(this.text);
  }

  validate() {
    const errors = [];

    if (this.length === 0) {
      errors.push("Aprašymas negali būti tuščias.");
    } else if (this.length < MIN_LENGTH) {
      errors.push(
        `Aprašymas per trumpas: reikia bent ${MIN_LENGTH} simbolių (dabar ${this.length}).`,
      );
    } else if (this.length > MAX_LENGTH) {
      errors.push(
        `Aprašymas per ilgas: leidžiama daugiausia ${MAX_LENGTH} simbolių (dabar ${this.length}).`,
      );
    }

    return errors;
  }
}

module.exports = { LifestyleDescription, MIN_LENGTH, MAX_LENGTH };
