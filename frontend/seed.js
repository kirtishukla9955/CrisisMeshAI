import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./authority/services/firebaseClient"; // adjust path if firebaseClient is in a different subfolder

const sampleIncidents = [
  { title: "Severe Urban Flooding", type: "Flood", status: "active", priority: "Critical", severity: 80, priorityScore: 95, latitude: 28.6139, longitude: 77.2090, locationName: "New Delhi", affectedPeople: 1200, confidence: 0.95, timestamp: serverTimestamp() },
  { title: "Earthquake Tremors", type: "Earthquake", status: "active", priority: "High", severity: 65, priorityScore: 70, latitude: 34.0837, longitude: 74.7973, locationName: "Srinagar", affectedPeople: 450, confidence: 0.88, timestamp: serverTimestamp() },
  { title: "NH-5 Highway Landslide", type: "Landslide", status: "active", priority: "Critical", severity: 85, priorityScore: 90, latitude: 31.1048, longitude: 77.1734, locationName: "Shimla", affectedPeople: 800, confidence: 0.94, timestamp: serverTimestamp() },
  { title: "Waterlogging in Low Areas", type: "Flood", status: "active", priority: "Moderate", severity: 40, priorityScore: 50, latitude: 30.9010, longitude: 75.8573, locationName: "Ludhiana", affectedPeople: 300, confidence: 0.75, timestamp: serverTimestamp() },
  { title: "Coastal Storm Surge", type: "Cyclone", status: "active", priority: "Critical", severity: 90, priorityScore: 98, latitude: 20.2961, longitude: 85.8245, locationName: "Bhubaneswar", affectedPeople: 5000, confidence: 0.96, timestamp: serverTimestamp() },
  { title: "River Overflow Alert", type: "Flood", status: "active", priority: "High", severity: 75, priorityScore: 82, latitude: 30.0869, longitude: 78.2676, locationName: "Rishikesh", affectedPeople: 600, confidence: 0.91, timestamp: serverTimestamp() },
  { title: "Flash Flood Warning", type: "Flood", status: "active", priority: "High", severity: 78, priorityScore: 84, latitude: 29.9457, longitude: 78.1642, locationName: "Haridwar", affectedPeople: 900, confidence: 0.89, timestamp: serverTimestamp() },
  { title: "Landslide Risk Zone", type: "Landslide", status: "active", priority: "Moderate", severity: 55, priorityScore: 60, latitude: 30.3165, longitude: 78.0322, locationName: "Dehradun", affectedPeople: 250, confidence: 0.81, timestamp: serverTimestamp() }
];

export async function runSeed() {
  console.log("Seeding started...");
  for (const incident of sampleIncidents) {
    await addDoc(collection(db, "incidents"), incident);
  }
  console.log("Seeding complete! Check your map.");
}