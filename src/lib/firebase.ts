import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDNkb9Qyu1rthEoPHuv31oCJRjnH3r2kgc",
  authDomain: "terraform-autosport-test4.firebaseapp.com",
  projectId: "terraform-autosport-test4",
  storageBucket: "terraform-autosport-test4.firebasestorage.app",
  messagingSenderId: "758505250578",
  appId: "1:758505250578:web:add4071b9fd9df4aa5ddcb"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, "dev-fb-autospotr-firestore");
export const auth = getAuth(app);
export const storage = getStorage(app, "gs://dev-autospotr-videos");
export default app;
