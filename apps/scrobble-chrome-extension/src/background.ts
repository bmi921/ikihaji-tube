import { treaty } from '@elysiajs/eden';
import type { App } from '@ikihaji-tube/api';
import type { Video } from '@ikihaji-tube/core/model';
import { getBaseUrl } from '@ikihaji-tube/core/util';
import { match } from 'ts-pattern';

chrome.runtime.onMessage.addListener(message => {
  const baseUrl = getBaseUrl({ app: 'api' }).toString();
  const client = treaty<App>(baseUrl);

  match(message.action)
    .with('push-video-to-viewing-history', async () => {
      chrome.storage.local.get(['userId', 'groupIds'], async (result) => {
        const { userId, groupIds } = result;

        if (!userId || !groupIds || groupIds.length === 0) {
          // biome-ignore lint/suspicious/noConsoleLog:
          console.error('User ID or Group ID is not set.');
          return;
        }

        const video: Video = message.data;
        const groupId = groupIds[0]; // Use the first group ID

        const endpoint = `${baseUrl}/groups/${groupId}/users/${userId}/viewing-history`;
        // biome-ignore lint/suspicious/noConsoleLog:
        console.log(`🚀 Sending viewing history to API...\n  - Endpoint: ${endpoint}\n  - Payload:`, [video]);

        const res = await client.api
          .groups({
            groupId: groupId,
          })
          .users({
            userId: userId,
          })
          ['viewing-history'].post([video]);

        // biome-ignore lint/suspicious/noConsoleLog:
        console.log('✅ Updated viewing history:', res.data?.body);
      });
    })
    .otherwise(() => {});
});
