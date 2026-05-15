export const normalizePhone = (phone = '') => {
  return phone.toString().replace(/\D/g, '');
};
