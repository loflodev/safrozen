import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAccount } from '../../shop/account'

// Déconnexion: signs out, then goes home.
export default function Logout() {
  const { logout } = useAccount()
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/', { replace: true })
    logout()
  }, [logout, navigate])
  return null
}
