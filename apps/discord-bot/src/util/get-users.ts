import { treaty } from '@elysiajs/eden';
import type { App } from '@ikihaji-tube/api';
import type { User } from '@ikihaji-tube/core/model';
import { getBaseUrl } from '@ikihaji-tube/core/util';

export const getUsers = async (groupId: string): Promise<User[]> => {
  const client = treaty<App>(getBaseUrl({ app: 'api' }).toString());
  const { data, error } = await client.api.groups({ groupId }).users.get();

  if (error) {
    throw new Error(`Failed to fetch users: ${error}`);
  }

  return data;
};
