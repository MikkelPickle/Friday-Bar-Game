import { httpsCallable } from "firebase/functions";
import { functions, db } from "../config/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";