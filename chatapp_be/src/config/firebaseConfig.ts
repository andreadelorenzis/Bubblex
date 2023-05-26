// Import the functions you need from the SDKs you need

import { initializeApp, getApp } from "firebase/app";
import { firebaseConfigData } from "./firebaseConfigData";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
const app = initializeApp(firebaseConfigData);

// Initialize Cloud Storage and get a reference to the service
export const firebaseStorage = getStorage(app, 'gs://chatapp-ce281.appspot.com');