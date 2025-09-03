import axios from 'axios';

// Create an instance of axios with the base URL
const api = axios.create({
  baseURL: "http://localhost:8000"
});

// Export the Axios instance
export default api;


//     try{
//     const response = await fetch("/api/signup/entrepreneur", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(startupData),
//     });       

//     if (!response.ok) {
//       throw new Error(`Error: ${response.statusText}`);
//     }

//     const result = await response.json();
//     console.log("✅ Saved successfully:", result);
//     setIsEditing(false);

//   } catch (error) {
//     console.error("❌ Failed to save:", error);
//   }
