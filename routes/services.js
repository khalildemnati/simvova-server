import axios from "axios";

const API_KEY = process.env.FIVESIM_API_KEY; // مفتاح API الخاص بـ 5SIM
const BASE_URL = "https://5sim.net/v1";

export async function getServices() {
  try {
    const response = await axios.get(`${BASE_URL}/guest/products`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const data = response.data;

    // تحويل الأسعار ×2 (أي 200%)
    const services = [];
    for (const country in data) {
      for (const service in data[country]) {
        const originalCost = data[country][service].cost;
        const multipliedCost = (originalCost * 2).toFixed(2); // 200%
        services.push({
          country,
          service,
          cost: multipliedCost,
          currency: "USD",
        });
      }
    }

    return services;
  } catch (error) {
    console.error("Error fetching services from 5SIM:", error.message);
    return [];
  }
}
