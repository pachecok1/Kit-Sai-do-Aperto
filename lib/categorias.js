export const CATEGORIES = [
  { id: 'moradia', label: 'Moradia', color: '#8B3A3A' },
  { id: 'alimentacao', label: 'Alimentação', color: '#C9A227' },
  { id: 'transporte', label: 'Transporte', color: '#6B8F71' },
  { id: 'saude', label: 'Saúde', color: '#4A6FA5' },
  { id: 'lazer', label: 'Lazer', color: '#B5651D' },
  { id: 'contas', label: 'Contas / Dívidas', color: '#5C4033' },
  { id: 'outros', label: 'Outros', color: '#8A8378' },
];

export const fmt = (n) =>
  (isFinite(n) ? n : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
