import api from './api';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', reg.scope);
      return reg;
    } catch (err) {
      console.error('Service Worker registration failed:', err);
      return null;
    }
  }
  return null;
};

export const subscribeUserToPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push messaging is not supported in this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was denied.');
  }

  const reg = await navigator.serviceWorker.ready;
  
  // Fetch public VAPID key from backend
  const keyRes = await api.get('/notifications/vapid-public-key');
  const publicKey = keyRes.data.publicKey;
  const convertedKey = urlBase64ToUint8Array(publicKey);

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey
  });

  // Send subscription to backend
  await api.post('/notifications/subscribe', { subscription });

  return subscription;
};

export const unsubscribeUserFromPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
      await subscription.unsubscribe();
    }
  } catch (err) {
    console.error('Error during unsubscribe from push:', err);
  }
};
