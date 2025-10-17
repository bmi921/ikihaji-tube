const userIdInput = document.getElementById('userId') as HTMLInputElement;
const groupIdsInput = document.getElementById('groupIds') as HTMLInputElement;
const saveButton = document.getElementById('save') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['userId', 'groupIds'], (result) => {
    if (result.userId) {
      userIdInput.value = result.userId;
    }
    if (result.groupIds) {
      groupIdsInput.value = result.groupIds.join(', ');
    }
  });
});

saveButton.addEventListener('click', () => {
  const userId = userIdInput.value;
  const groupIds = groupIdsInput.value.split(',').map(s => s.trim()).filter(s => s);

  if (!userId) {
    statusDiv.textContent = 'User ID is required.';
    statusDiv.style.color = 'red';
    return;
  }

  chrome.storage.local.set({ userId, groupIds }, () => {
    statusDiv.textContent = 'Settings saved!';
    statusDiv.style.color = 'green';
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 2000);
  });
});
