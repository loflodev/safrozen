import { PROVINCES } from '../../shop/address'
import Field from './Field'

type FieldProps = { id: string; name: string; value: string; error?: string; onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>; onBlur: () => void }

// Name and postal address fields, prefixed (billing_, shipping_) like
// WooCommerce's, with the right autocomplete tokens for each section.
export default function AddressFields({
  prefix,
  field,
  section,
}: {
  prefix: 'billing' | 'shipping'
  field: (name: string) => FieldProps
  section: 'billing' | 'shipping'
}) {
  const ac = (token: string) => `section-${section} ${section} ${token}`
  const f = (n: string) => field(`${prefix}_${n}`)
  return (
    <div className="form-grid form-grid--2">
      <Field label="Prénom" autoComplete={ac('given-name')} {...f('firstName')} />
      <Field label="Nom" autoComplete={ac('family-name')} {...f('lastName')} />
      <Field label="Adresse" full autoComplete={ac('address-line1')} {...f('address1')} />
      <Field label="Appartement, bureau" optional full autoComplete={ac('address-line2')} {...f('address2')} />
      <Field label="Ville" autoComplete={ac('address-level2')} {...f('city')} />
      <Field as="select" label="Province" autoComplete={ac('address-level1')} {...f('province')}>
        {PROVINCES.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </Field>
      <Field
        label="Code postal"
        autoComplete={ac('postal-code')}
        autoCapitalize="characters"
        help="Par exemple H2T 1R2"
        {...f('postcode')}
      />
    </div>
  )
}
