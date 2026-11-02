import { provinceName } from '../../shop/address'
import type { Address } from '../../shop/orders'

// A postal address as an <address> block.
export default function AddressBlock({ address }: { address: Address }) {
  return (
    <address className="address-block">
      {address.firstName} {address.lastName}
      <br />
      {address.address1}
      {address.address2 && `, ${address.address2}`}
      <br />
      {address.city} ({provinceName(address.province)}) {address.postcode}
      {address.phone && (
        <>
          <br />
          {address.phone}
        </>
      )}
    </address>
  )
}
