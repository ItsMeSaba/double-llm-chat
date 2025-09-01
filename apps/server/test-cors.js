#!/usr/bin/env node

/**
 * Simple CORS test script
 * Run this to test if your CORS configuration is working
 */

const testOrigins = [
  "http://localhost:5173", // Should be allowed
  "http://localhost:3000", // Should be allowed
  "http://127.0.0.1:5173", // Should be allowed
  "http://127.0.0.1:3000", // Should be allowed
  "http://malicious-site.com", // Should be blocked
  "https://evil.com", // Should be blocked
  undefined, // Should be allowed (no origin)
];

async function testCORS(origin) {
  const headers = {};
  if (origin) {
    headers["Origin"] = origin;
  }

  try {
    const response = await fetch("http://localhost:3000/health", {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (response.ok) {
      console.log(`✅ ${origin || "No Origin"} - ALLOWED`);
    } else {
      console.log(
        `❌ ${origin || "No Origin"} - BLOCKED (Status: ${response.status})`
      );
    }
  } catch (error) {
    if (error.message.includes("CORS")) {
      console.log(`❌ ${origin || "No Origin"} - BLOCKED (CORS Error)`);
    } else {
      console.log(`❌ ${origin || "No Origin"} - ERROR: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log("🧪 Testing CORS Configuration...\n");
  console.log("Server should be running on http://localhost:3000\n");

  for (const origin of testOrigins) {
    await testCORS(origin);
    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n📋 Test Summary:");
  console.log("- ✅ = Origin allowed");
  console.log("- ❌ = Origin blocked");
  console.log(
    "\n💡 If you see CORS errors, check your server is running and CORS config is correct."
  );
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3000/health");
    if (response.ok) {
      console.log("✅ Server is running on http://localhost:3000");
      await runTests();
    } else {
      console.log("❌ Server responded but health check failed");
    }
  } catch (error) {
    console.log(
      "❌ Cannot connect to server. Make sure it's running on http://localhost:3000"
    );
    console.log("💡 Start the server with: yarn dev");
  }
}

checkServer();
