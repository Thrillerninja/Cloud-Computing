import { isIP } from 'is-ip';

export const validateIp = (ip) => {
  return isIP(ip);
};
