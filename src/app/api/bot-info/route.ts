import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'Telegram bot token is not configured.' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return NextResponse.json({ error: `Failed to get bot info: ${errorData.description}` }, { status: response.status });
    }

    const data = await response.json();
    if (data.ok && data.result) {
      return NextResponse.json({ 
        username: data.result.username,
        firstName: data.result.first_name,
        id: data.result.id,
       });
    } else {
      return NextResponse.json({ error: 'Could not retrieve bot username.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching bot info:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
