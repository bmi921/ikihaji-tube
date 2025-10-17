import { treaty } from '@elysiajs/eden';
import type { App } from '@ikihaji-tube/api';
import type { User } from '@ikihaji-tube/core/model';
import { getBaseUrl } from '@ikihaji-tube/core/util';

export const getUsers = async (): Promise<User[]> => {
  const client = treaty<App>(getBaseUrl({ app: 'api' }).toString());
  console.log('Fetching groups data from API at: ', getBaseUrl({ app: 'api' }).toString());

  const res = await client.api.groups.get();
  console.log('groups data was fetched: ', res.data);
  if (res.data === null) {
    throw new Error('Failed to fetch groups');
  }

  const users = res.data.flatMap(group => group.users);

  return users;
};
