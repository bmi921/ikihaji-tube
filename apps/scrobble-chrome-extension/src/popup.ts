const userIdInput = document.getElementById('userId') as HTMLInputElement;
const groupIdsInput = document.getElementById('groupIds') as HTMLInputElement;
const saveButton = document.getElementById('save') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const loginButton = document.getElementById('login-button') as HTMLButtonElement;
const userInfoDiv = document.getElementById('user-info') as HTMLDivElement;
const guildSelect = document.getElementById('guild-select') as HTMLSelectElement;

const profileInfoDiv = document.getElementById('profile-info') as HTMLDivElement;
const userAvatarImg = document.getElementById('user-avatar') as HTMLImageElement;
const userNameP = document.getElementById('user-name') as HTMLParagraphElement;
const selectedGuildInfoDiv = document.getElementById('selected-guild-info') as HTMLDivElement;
const guildAvatarImg = document.getElementById('guild-avatar') as HTMLImageElement;
const guildNameSpan = document.getElementById('guild-name') as HTMLSpanElement;

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['userId', 'groupIds', 'userName', 'userAvatar', 'guildName', 'guildAvatar'], result => {
    if (result['userId']) {
      userIdInput.value = result['userId'];
      groupIdsInput.value = result['groupIds'].join(', ');
      userNameP.textContent = result['userName'];
      userAvatarImg.src = result['userAvatar'];
      profileInfoDiv.style.display = 'flex';

      if (result['guildName']) {
        guildNameSpan.textContent = result['guildName'];
        guildAvatarImg.src = result['guildAvatar'];
        selectedGuildInfoDiv.style.display = 'flex';
      }

      userInfoDiv.style.display = 'block';
      loginButton.textContent = 'Logout';
    }
  });
});

loginButton.addEventListener('click', () => {
  if (loginButton.textContent === 'Logout') {
    chrome.storage.local.remove(
      ['userId', 'groupIds', 'discord_access_token', 'userName', 'userAvatar', 'guildName', 'guildAvatar'],
      () => {
        userIdInput.value = '';
        groupIdsInput.value = '';
        userInfoDiv.style.display = 'none';
        profileInfoDiv.style.display = 'none';
        selectedGuildInfoDiv.style.display = 'none';
        loginButton.textContent = 'Login with Discord';
        guildSelect.innerHTML = '';
        statusDiv.textContent = 'Logged out.';
        setTimeout(() => {
          statusDiv.textContent = '';
        }, 2000);
      },
    );
    return;
  }

  const clientId = '1428369369699713108';
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  const scope = 'identify guilds';
  const state = crypto.randomUUID();

  const authUrl = new URL('https://discord.com/oauth2/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl.href,
      interactive: true,
    },
    async redirectUrl => {
      if (chrome.runtime.lastError || !redirectUrl) {
        statusDiv.textContent = 'Authentication failed.';
        statusDiv.style.color = 'red';
        console.error(chrome.runtime.lastError?.message);
        return;
      }

      const fragment = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
      const accessToken = fragment.get('access_token');
      const returnedState = fragment.get('state');

      if (!accessToken || returnedState !== state) {
        statusDiv.textContent = 'Token or state mismatch.';
        statusDiv.style.color = 'red';
        return;
      }

      chrome.storage.local.set({ discord_access_token: accessToken }, async () => {
        try {
          const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!userResponse.ok) throw new Error('Failed to fetch user.');
          const userData = await userResponse.json();

          const userAvatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
          userIdInput.value = userData.id;
          userNameP.textContent = userData.username;
          userAvatarImg.src = userAvatarUrl;
          profileInfoDiv.style.display = 'flex';

          const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!guildsResponse.ok) throw new Error('Failed to fetch guilds.');
          const guildsData = await guildsResponse.json();

          // todo: ikihaji-tube botが入ってるギルドをgroupsテーブルから取得して絞る
          guildsData.forEach((guild: { id: string; name: string; icon: string }) => {
            const option = document.createElement('option');
            option.value = guild.id;
            option.textContent = guild.name;

            const iconUrl = guild.icon
              ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
              : 'https://cdn.discordapp.com/embed/avatars/0.png';

            option.dataset['icon'] = iconUrl;
            option.dataset['name'] = guild.name;
            guildSelect.appendChild(option);
          });

          userInfoDiv.style.display = 'block';
          loginButton.textContent = 'Logout';
          statusDiv.textContent = 'Login successful!';
          statusDiv.style.color = 'green';

          chrome.storage.local.set({
            userName: userData.username,
            userAvatar: userAvatarUrl,
          });
        } catch (error) {
          statusDiv.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          statusDiv.style.color = 'red';
        }
      });
    },
  );
});

guildSelect.addEventListener('change', () => {
  const selectedOption = guildSelect.options[guildSelect.selectedIndex];
  if (!selectedOption?.value) {
    selectedGuildInfoDiv.style.display = 'none';
    return;
  }

  const guildId = selectedOption.value;
  const guildAvatarUrl = selectedOption.dataset['icon'];
  const guildName = selectedOption.dataset['name'];

  if (guildAvatarUrl) {
    groupIdsInput.value = guildId;
    guildNameSpan.textContent = guildName ?? '';

    guildAvatarImg.src = guildAvatarUrl;
    selectedGuildInfoDiv.style.display = 'flex';
  } else {
    selectedGuildInfoDiv.style.display = 'none';
  }
});

saveButton.addEventListener('click', () => {
  const userId = userIdInput.value;
  const groupIds = [groupIdsInput.value];
  const guildName = guildNameSpan.textContent;
  const guildAvatar = guildAvatarImg.src;

  if (userId && groupIds) {
    statusDiv.textContent = 'User ID and Server ID are required.';
    statusDiv.style.color = 'red';
    return;
  }

  chrome.storage.local.set({ userId, groupIds, guildName, guildAvatar }, () => {
    statusDiv.textContent = 'Settings saved!';
    statusDiv.style.color = 'green';
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 2000);
  });
});
