/**
 * Create-form fields per schema target — the demo's authoring vocabulary for in-app creates.
 * Deliberately a subset of each schema: enough to make the scenario real, small enough to type
 * on a phone. The server validates against the full schema either way.
 */

export interface SchemaField {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number';
  placeholder?: string;
  /** When set, the field renders as a pick from these — a short list beats a free field. */
  options?: { value: string; label: string }[];
  /** Written without spaces and in upper case: Geena stores an IBAN in electronic format. */
  compact?: boolean;
}

/** The demo's market: the EU, no home bias. Values are ISO codes — what the schema stores. */
const COUNTRIES: { value: string; label: string }[] = [
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'PL', label: 'Poland' },
  { value: 'IE', label: 'Ireland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'SE', label: 'Sweden' },
  { value: 'AT', label: 'Austria' },
];

/** Geena's identity document codes, with the label the demo shows for each. */
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  identity_card: 'Identity card',
  driving_licence: 'Driving licence',
  residence_permit: 'Residence permit',
  travel_document: 'Travel document',
  visa: 'Visa',
  other: 'Other',
};

export const SCHEMA_FIELDS: Record<string, SchemaField[]> = {
  PersonFullName: [
    { key: 'firstName', label: 'First name' },
    { key: 'lastName', label: 'Last name' },
  ],
  PersonEmail: [{ key: 'email', label: 'Email', type: 'email' }],
  PersonPhone: [
    { key: 'telephone', label: 'Phone', type: 'tel', placeholder: '+31 6 1234 5678' },
  ],
  PersonIdentityDocument: [
    {
      key: 'documentType',
      label: 'Document type',
      options: ['passport', 'identity_card', 'residence_permit'].map((value) => ({
        value,
        label: DOCUMENT_TYPE_LABELS[value],
      })),
    },
    { key: 'documentNumber', label: 'Document number' },
    { key: 'issuingCountry', label: 'Issuing country', options: COUNTRIES },
    { key: 'expiryDate', label: 'Expiry date', type: 'date' },
  ],
  PersonAddress: [
    { key: 'streetAddress', label: 'Street address' },
    { key: 'postalCode', label: 'Postal code' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country', options: COUNTRIES },
  ],
  PersonSex: [
    {
      key: 'sex',
      label: 'Sex',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ],
    },
  ],
  PersonBirthDetails: [{ key: 'dateOfBirth', label: 'Date of birth', type: 'date' }],
  PersonJob: [
    { key: 'jobTitle', label: 'Job title' },
    { key: 'employerName', label: 'Employer' },
    {
      key: 'employmentType',
      label: 'Employment type',
      options: [
        { value: 'employee', label: 'Employee' },
        { value: 'self_employed_with_employees', label: 'Self-employed with employees' },
        { value: 'self_employed_without_employees', label: 'Self-employed without employees' },
        { value: 'dependent_contractor', label: 'Dependent contractor' },
        { value: 'family_worker', label: 'Contributing family worker' },
        { value: 'other', label: 'Other' },
      ],
    },
  ],
  PersonFinancialProfile: [
    {
      key: 'grossAnnualIncome',
      label: 'Gross annual income',
      type: 'number',
      placeholder: '85000',
    },
    { key: 'grossAnnualIncomeCurrency', label: 'Currency', placeholder: 'EUR' },
  ],
  PersonBankAccount: [
    { key: 'bankName', label: 'Bank' },
    { key: 'accountNumber', label: 'Account number (IBAN)', compact: true },
    { key: 'currency', label: 'Currency', placeholder: 'EUR' },
  ],
  PersonTaxStatus: [
    { key: 'taxResidenceCountry', label: 'Tax residence country', options: COUNTRIES },
    { key: 'taxId', label: 'Tax identification number' },
  ],
};

/**
 * A phone number in E.164, the form PersonPhone stores: typed with its country code, the
 * separators people type dropped (spaces, dashes, dots, brackets, a "(0)" after the code), a
 * leading 00 read as +. Undefined when what is left is not E.164.
 */
export function toE164(typed: string): string | undefined {
  const compact = typed
    .replace(/\(0\)/g, '')
    .replace(/[\s.()-]/g, '')
    .replace(/^00/, '+');
  return /^\+[1-9][0-9]{1,14}$/.test(compact) ? compact : undefined;
}

/**
 * What a form's values write to a record: empty fields left out, a phone number in E.164, an
 * amount as a number (the schema types it so, and refuses one below zero), an IBAN without spaces
 * and in upper case. Throws, saying what to type, when a phone number or an amount cannot be read.
 */
export function recordData(
  target: string,
  values: Record<string, string>,
): Record<string, string | number> {
  const fields = new Map((SCHEMA_FIELDS[target] ?? []).map((field) => [field.key, field]));
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === '') continue;
    const type = fields.get(key)?.type;
    if (type === 'tel') {
      const phone = toE164(value);
      if (!phone) {
        throw new Error('Type the phone number with its country code, like +31 6 1234 5678.');
      }
      out[key] = phone;
    } else if (type === 'number') {
      const amount = Number(value);
      if (!Number.isFinite(amount) || amount < 0) {
        throw new Error('Type the amount as a number, like 85000.');
      }
      out[key] = amount;
    } else if (fields.get(key)?.compact) {
      out[key] = value.replace(/\s+/g, '').toUpperCase();
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Singleton schemas hold one value per person (a person has one legal name, one birth date):
 * picking between instances makes no sense, so the filler shows a value form instead — under
 * the hood the existing (possibly empty starter) document is attached and written, or created
 * when none exists. The set is Geena's person singletons; a job is not one, since a person can
 * hold several.
 */
export const SINGLETON_TARGETS = new Set([
  'PersonFullName',
  'PersonSex',
  'PersonBirthDetails',
  'PersonNationality',
  'PersonTaxStatus',
  'PersonFinancialProfile',
]);

/**
 * Label presets for multi-instance targets — the org supplies the vocabulary, the user taps one
 * (or writes their own). The first entry is the default, so a create is never nameless.
 */
export const LABEL_OPTIONS: Record<string, string[]> = {
  PersonEmail: ['Personal', 'Work'],
  PersonPhone: ['Mobile', 'Work', 'Home'],
  PersonAddress: ['Home', 'Work', 'Second home'],
  PersonBankAccount: ['Main account', 'Savings', 'Joint'],
  PersonIdentityDocument: ['Passport', 'National ID'],
  PersonJob: ['Current job', 'Previous job'],
};
