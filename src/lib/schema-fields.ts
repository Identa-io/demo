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
}

export const SCHEMA_FIELDS: Record<string, SchemaField[]> = {
  PersonFullName: [
    { key: 'firstName', label: 'First name' },
    { key: 'lastName', label: 'Last name' },
  ],
  PersonEmail: [{ key: 'email', label: 'Email', type: 'email' }],
  PersonPhone: [{ key: 'telephone', label: 'Phone', type: 'tel', placeholder: '+46 …' }],
  PersonAddress: [
    { key: 'streetAddress', label: 'Street address' },
    { key: 'postalCode', label: 'Postal code' },
    { key: 'city', label: 'City' },
    { key: 'addressCountry', label: 'Country', placeholder: 'SE' },
  ],
  PersonBirthDetails: [{ key: 'dateOfBirth', label: 'Date of birth', type: 'date' }],
  PersonJob: [
    { key: 'jobTitle', label: 'Job title' },
    { key: 'employerName', label: 'Employer' },
    { key: 'employmentType', label: 'Employment type', placeholder: 'full-time' },
  ],
  PersonFinancialProfile: [
    { key: 'grossAnnualIncome', label: 'Gross annual income' },
    { key: 'grossAnnualIncomeCurrency', label: 'Currency', placeholder: 'EUR' },
  ],
  PersonBankAccount: [
    { key: 'bankName', label: 'Bank' },
    { key: 'accountNumber', label: 'Account number (IBAN)' },
    { key: 'currency', label: 'Currency', placeholder: 'EUR' },
  ],
  PersonTaxStatus: [
    { key: 'taxResidenceCountry', label: 'Tax residence country', placeholder: 'SE' },
    { key: 'taxID', label: 'Tax identification number' },
  ],
};

/**
 * Singleton schemas hold one value per person (a person has one legal name, one birth date):
 * picking between instances makes no sense, so the filler shows a value form instead — under
 * the hood the existing (possibly empty starter) document is attached and written, or created
 * when none exists.
 */
export const SINGLETON_TARGETS = new Set([
  'PersonFullName',
  'PersonBirthDetails',
  'PersonTaxStatus',
  'PersonFinancialProfile',
  'PersonJob',
]);

/** Label suggestions for multi-instance targets — the org's hint for naming a new value. */
export const LABEL_HINTS: Record<string, string> = {
  PersonEmail: 'e.g. Personal, Work',
  PersonPhone: 'e.g. Mobile, Work',
  PersonAddress: 'e.g. Home, Work',
  PersonBankAccount: 'e.g. Main account',
};
