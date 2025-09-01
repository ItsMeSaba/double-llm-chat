#!/usr/bin/env node

/**
 * Cookie test script
 * Run this to test if cookie-parser is working correctly
 */

async function testCookies() {
  console.log("🍪 Testing Cookie Parser...\n");
  console.log("Server should be running on http://localhost:3000\n");

  try {
    // Test setting cookies
    console.log("1️⃣ Setting test cookies...");
    const setResponse = await fetch(
      "http://localhost:3000/cookie-test/test-cookies",
      {
        credentials: "include",
      }
    );

    if (setResponse.ok) {
      const setData = await setResponse.json();
      console.log("✅ Cookies set successfully");
      console.log("📋 Response:", setData);
    } else {
      console.log("❌ Failed to set cookies:", setResponse.status);
      return;
    }

    // Test reading cookies
    console.log("\n2️⃣ Reading test cookies...");
    const readResponse = await fetch(
      "http://localhost:3000/cookie-test/read-cookies?cookieName=test-cookie",
      {
        credentials: "include",
      }
    );

    if (readResponse.ok) {
      const readData = await readResponse.json();
      console.log("✅ Cookies read successfully");
      console.log("📋 Response:", readData);
    } else {
      console.log("❌ Failed to read cookies:", readResponse.status);
    }

    // Test reading signed cookies
    console.log("\n3️⃣ Reading signed cookies...");
    const signedResponse = await fetch(
      "http://localhost:3000/cookie-test/read-cookies?cookieName=signed-cookie",
      {
        credentials: "include",
      }
    );

    if (signedResponse.ok) {
      const signedData = await signedResponse.json();
      console.log("✅ Signed cookies read successfully");
      console.log("📋 Response:", signedData);
    } else {
      console.log("❌ Failed to read signed cookies:", signedResponse.status);
    }

    // Test reading all cookies
    console.log("\n4️⃣ Reading all cookies...");
    const allResponse = await fetch(
      "http://localhost:3000/cookie-test/read-cookies",
      {
        credentials: "include",
      }
    );

    if (allResponse.ok) {
      const allData = await allResponse.json();
      console.log("✅ All cookies read successfully");
      console.log("📋 Response:", allData);
    } else {
      console.log("❌ Failed to read all cookies:", allResponse.status);
    }

    console.log("\n🎉 Cookie test completed!");
  } catch (error) {
    console.log("❌ Error during cookie test:", error.message);
    console.log("💡 Make sure the server is running on http://localhost:3000");
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3000/health");
    if (response.ok) {
      console.log("✅ Server is running on http://localhost:3000");
      await testCookies();
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
