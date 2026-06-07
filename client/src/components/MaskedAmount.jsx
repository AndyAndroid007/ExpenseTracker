import { useContext } from 'react';
import { MaskContext } from '../context/MaskContext';

export default function MaskedAmount({ amount, prefix = '₹' }) {
  const { masked } = useContext(MaskContext);
  if (masked) return <span>••••</span>;
  if (amount == null) return <span>—</span>;
  const formatted = typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount;
  return <span>{prefix}{formatted}</span>;
}
