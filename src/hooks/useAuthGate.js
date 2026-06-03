import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGuestGuard } from '../context/GuestGuardContext';

/**
 * useAuthGate
 * Returns a wrapper that checks auth before running a protected action.
 * If the user is not logged in, saves their intent and sends them to login.
 *
 * Usage:
 *   const requireAuth = useAuthGate();
 *
 *   // In a click handler:
 *   requireAuth(() => addToCart(product), 'cart');
 *   requireAuth(() => navigate('/checkout'), 'checkout');
 *   requireAuth(() => navigate('/messages/seller1'), 'chat');
 */
export function useAuthGate() {
  const { user } = useAuth();
  const { setIntent } = useGuestGuard();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(
    (action, actionType = 'login') => {
      if (user) {
        // Already logged in — just run the action
        action();
      } else {
        // Save where they were and what they wanted to do
        setIntent(location.pathname, actionType);
        navigate('/login', { state: { from: location.pathname, action: actionType } });
      }
    },
    [user, setIntent, navigate, location]
  );

  return requireAuth;
}
