import type { User } from './user';

export type Group = {
  id: string;
  users: User[];
};
