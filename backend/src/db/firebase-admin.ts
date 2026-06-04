import { cert, getApps, initializeApp, type AppOptions } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

import { env } from "../config/env.js";
import { serviceUnavailable } from "../http/errors.js";

const parseServiceAccount = () => {
  if (!env.firebaseServiceAccountJson) return undefined;
  try {
    const serviceAccount = JSON.parse(env.firebaseServiceAccountJson) as Record<string, string>;
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    return cert(serviceAccount);
  } catch {
    throw serviceUnavailable("FIREBASE_SERVICE_ACCOUNT_JSON must be valid Firebase service account JSON.");
  }
};

export const getFirebaseAdminApp = () => {
  const existing = getApps()[0];
  if (existing) return existing;

  const options: AppOptions = { projectId: env.firebaseProjectId };
  const credential = parseServiceAccount();
  if (credential) options.credential = credential;

  return initializeApp(options);
};

export const getFirebaseMessaging = () => getMessaging(getFirebaseAdminApp());

