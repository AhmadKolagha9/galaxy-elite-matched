'use client'

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, isSupported, onMessage, type Messaging, type MessagePayload } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
}

export function isFirebasePushConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId)
}

export function getFirebasePushApp(): FirebaseApp | null {
  if (!isFirebasePushConfigured()) return null
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

export async function getFirebasePushMessaging(): Promise<Messaging | null> {
  if (!(await isSupported())) return null
  const app = getFirebasePushApp()
  return app ? getMessaging(app) : null
}

export async function requestFirebasePushToken() {
  const messaging = await getFirebasePushMessaging()
  if (!messaging) return null
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  return getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, serviceWorkerRegistration })
}

export async function onForegroundPushMessage(handler: (payload: MessagePayload) => void) {
  const messaging = await getFirebasePushMessaging()
  if (!messaging) return () => undefined
  return onMessage(messaging, handler)
}
