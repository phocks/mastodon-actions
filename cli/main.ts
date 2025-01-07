import "jsr:@std/dotenv/load";
import { htmlToText } from 'html-to-text';

const url = 'https://masto.byrd.ws/api/v1/streaming/public';
const token = Deno.env.get("TOKEN");

async function streamMastodon() {
  console.log('Fetching stream...');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.body) {
    console.error('No response body');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.content) {
            const textContent = htmlToText(json.content, {
              wordwrap: 90
            });
            const username = json.account.username;
            const acct = json.account.acct;
            const createdAt = new Date(json.created_at).toLocaleString();
            console.log(`--- ${createdAt} ---`);
            console.log(`${username} (@${acct}):\n\n${textContent.trim()}\n`);
          }
        } catch (e) {
          console.error('Failed to parse JSON:', e);
        }
      }
    }
  }
}

streamMastodon().catch(console.error);