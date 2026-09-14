/**
 * Tax ID Validation Utilities
 * Validates tax IDs for multiple countries
 */

/**
 * Validates CPF (Brazilian Individual Tax ID)
 * @param cpf - CPF string (can be formatted or not)
 * @returns boolean
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check length
  if (cleanCPF.length !== 11) return false;

  // Check for known invalid CPFs (all digits the same)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(9))) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Validates CNPJ (Brazilian Company Tax ID)
 * @param cnpj - CNPJ string (can be formatted or not)
 * @returns boolean
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Check length
  if (cleanCNPJ.length !== 14) return false;

  // Check for known invalid CNPJs (all digits the same)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Validate first check digit
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  // Validate second check digit
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

/**
 * Validates SSN (US Social Security Number)
 * @param ssn - SSN string (can be formatted or not)
 * @returns boolean
 */
export function validateSSN(ssn: string): boolean {
  const cleanSSN = ssn.replace(/\D/g, '');

  // Must be 9 digits
  if (cleanSSN.length !== 9) return false;

  // Cannot be all zeros or have all zeros in any group
  if (cleanSSN === '000000000') return false;
  if (cleanSSN.substring(0, 3) === '000') return false;
  if (cleanSSN.substring(3, 5) === '00') return false;
  if (cleanSSN.substring(5, 9) === '0000') return false;

  // Cannot start with 666 or 900-999
  const firstThree = parseInt(cleanSSN.substring(0, 3));
  if (firstThree === 666 || firstThree >= 900) return false;

  return true;
}

/**
 * Validates EIN (US Employer Identification Number)
 * @param ein - EIN string (can be formatted or not)
 * @returns boolean
 */
export function validateEIN(ein: string): boolean {
  const cleanEIN = ein.replace(/\D/g, '');

  // Must be 9 digits
  if (cleanEIN.length !== 9) return false;

  // First two digits must be valid (01-99, excluding some ranges)
  const firstTwo = parseInt(cleanEIN.substring(0, 2));
  if (firstTwo < 1 || firstTwo > 99) return false;

  return true;
}

/**
 * Validates DNI/NIF (Spanish Individual Tax ID)
 * Format: 8 digits + control letter (e.g. 12345678Z)
 * @param nif - NIF string (can be formatted or not)
 * @returns boolean
 */
export function validateDNI(nif: string): boolean {
  const clean = nif.toUpperCase().replace(/[\s.-]/g, '');

  if (!/^\d{8}[A-Z]$/.test(clean)) return false;

  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const digits = parseInt(clean.substring(0, 8), 10);
  return letters[digits % 23] === clean.charAt(8);
}

/**
 * Validates NIE (Foreigner Identity Number, Spain)
 * Format: X/Y/Z + 7 digits + control letter
 * @param nie - NIE string
 * @returns boolean
 */
export function validateNIE(nie: string): boolean {
  const clean = nie.toUpperCase().replace(/[\s.-]/g, '');

  if (!/^[XYZ]\d{7}[A-Z]$/.test(clean)) return false;

  const prefixMap: Record<string, string> = { X: '0', Y: '1', Z: '2' };
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const digits = prefixMap[clean.charAt(0)] + clean.substring(1, 8);
  return letters[parseInt(digits, 10) % 23] === clean.charAt(8);
}

/**
 * Validates CIF (Spanish Company Tax ID)
 * Format: letter + 7 digits + control char (digit or letter)
 * @param cif - CIF string
 * @returns boolean
 */
export function validateCIF(cif: string): boolean {
  const clean = cif.toUpperCase().replace(/[\s-]/g, '');

  if (!/^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/.test(clean)) return false;

  const digits = clean.substring(1, 8);
  let sumA = 0; // odd positions sum
  let sumB = 0; // even positions digits * 2
  for (let i = 0; i < 7; i++) {
    const d = parseInt(digits.charAt(i), 10);
    if (i % 2 === 0) {
      const doubled = d * 2;
      sumA += Math.floor(doubled / 10) + (doubled % 10);
    } else {
      sumB += d;
    }
  }
  const control = (10 - ((sumA + sumB) % 10)) % 10;
  const controlDigit = String(control);
  const controlLetter = 'JABCDEFGHI'[control];

  const firstLetter = clean.charAt(0);
  const expected = clean.charAt(8);
  // Organizations whose control must be a LETTER: K, P, Q, S, N, W, R (public bodies)
  if ('KPQSNWR'.includes(firstLetter)) return expected === controlLetter;
  // Organizations whose control must be a DIGIT: A, B, E, H (SAs, SLs, etc.)
  if ('ABEH'.includes(firstLetter)) return expected === controlDigit;
  // Both allowed for the rest (J, G...)
  return expected === controlDigit || expected === controlLetter;
}

/**
 * Validates VAT number for any EU country (fallback: alphanumeric length check)
 * @param vat - VAT string, optionally prefixed with country code (ES, IT, DE, FR, PT...)
 * @returns boolean
 */
export function validateVAT(vat: string): boolean {
  const clean = vat.toUpperCase().replace(/[\s.-]/g, '');

  // Spanish formats: NIF (8 digits + letter), NIE (X/Y/Z + 7 digits + letter), CIF (letter + 7 digits + control)
  if (clean.startsWith('ES')) {
    const body = clean.substring(2);
    return validateDNI(body) || validateNIE(body) || validateCIF(body);
  }

  // Generic EU check: country code (2 letters) + 8-12 alphanumeric chars
  if (/^[A-Z]{2}[A-Z0-9]{8,12}$/.test(clean)) return true;

  // Bare Spanish NIF/CIF/NIE without ES prefix
  return validateDNI(clean) || validateNIE(clean) || validateCIF(clean);
}

/**
 * Validates CUIT/CUIL (Argentine Tax ID)
 * @param cuit - CUIT string (can be formatted or not)
 * @returns boolean
 */
export function validateCUIT(cuit: string): boolean {
  const cleanCUIT = cuit.replace(/\D/g, '');

  if (cleanCUIT.length !== 11) return false;

  // Check digit validation
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCUIT.charAt(i)) * multipliers[i];
  }

  const checkDigit = 11 - (sum % 11);
  const calculatedCheck = checkDigit === 11 ? 0 : checkDigit === 10 ? 9 : checkDigit;

  return calculatedCheck === parseInt(cleanCUIT.charAt(10));
}

/**
 * Validates Tax ID based on country and type
 * @param taxId - Tax ID string
 * @param country - Country code (BR, US, AR, MX, etc.)
 * @param type - person or company
 * @returns boolean
 */
export function validateTaxId(taxId: string, country: string, type: 'person' | 'company'): boolean {
  if (!taxId) return true; // Empty is valid (handled by required validation)

  switch (country) {
    case 'ES':
      // Spain: person -> DNI/NIE, company -> CIF (or EU VAT for foreign companies)
      return type === 'person' ? validateDNI(taxId) || validateNIE(taxId) : validateCIF(taxId) || validateVAT(taxId);
    case 'BR':
      return type === 'person' ? validateCPF(taxId) : validateCNPJ(taxId);
    case 'US':
      return type === 'person' ? validateSSN(taxId) : validateEIN(taxId);
    case 'AR':
      return validateCUIT(taxId); // Same for person/company
    case 'MX':
      // RFC validation is complex, just check length
      const cleanRFC = taxId.replace(/[^A-Z0-9]/g, '');
      return type === 'person' ? cleanRFC.length === 13 : cleanRFC.length === 12;
    default:
      // EU and other countries: accept VAT (IT..., DE..., FR...) or any non-empty value
      return validateVAT(taxId) || taxId.length > 0;
  }
}

/**
 * Formats CPF string
 * @param cpf - CPF string (only numbers)
 * @returns Formatted CPF (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formats CNPJ string
 * @param cnpj - CNPJ string (only numbers)
 * @returns Formatted CNPJ (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Get Tax ID label by country and type
 * @param country - Country code
 * @param type - person or company
 * @returns Label string
 */
export function getTaxIdLabel(country: string, type: 'person' | 'company'): string {
  const labels: Record<string, { person: string; company: string }> = {
    ES: { person: 'DNI/NIF', company: 'CIF/NIF' },
    BR: { person: 'CPF', company: 'CNPJ' },
    US: { person: 'SSN', company: 'EIN' },
    AR: { person: 'CUIL', company: 'CUIT' },
    MX: { person: 'RFC', company: 'RFC' },
    CA: { person: 'SIN', company: 'BN' },
  };

  return labels[country]?.[type] || (type === 'person' ? 'NIF / Documento' : 'CIF / VAT');
}
