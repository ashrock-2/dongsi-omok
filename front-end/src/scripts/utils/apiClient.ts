import type { ClientCommand, ServerCommand } from '@dongsi-omok/shared';

const API_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:8080';

export const sendCommand = async (command: ClientCommand): Promise<any> => {
  const response = await fetch(`${API_URL}/api/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-ID': localStorage.getItem('clientId') || '',
    },
    body: JSON.stringify(command),
  });
  return response.json();
};

export const connectSSE = (
  onMessage: (data: ServerCommand) => void,
): EventSource => {
  const eventSource = new EventSource(`${API_URL}/api/events`, {
    withCredentials: true,
  });

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
    eventSource.close();
  };

  return eventSource;
};
