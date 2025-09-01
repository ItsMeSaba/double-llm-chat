#!/usr/bin/env node

/**
 * Logout endpoint test script
 * Run this to test if the logout endpoint is working correctly
 */

async function testLogout() {
  console.log("🚪 Testing Logout Endpoint...\n");
  console.log("Server should be running on http://localhost:3000\n");

  try {
    // Test logout without any cookies (should still work)
    console.log("1️⃣ Testing logout without cookies...");
    const logoutResponse = await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (logoutResponse.ok) {
      const logoutData = await logoutResponse.json();
      console.log("✅ Logout successful (no cookies)");
      console.log("📋 Response:", logoutData);
    } else {
      console.log("❌ Logout failed:", logoutResponse.status);
      const errorData = await logoutResponse.text();
      console.log("📋 Error:", errorData);
    }

    // Test logout with invalid cookies (should still work)
    console.log("\n2️⃣ Testing logout with invalid cookies...");
    const logoutWithCookiesResponse = await fetch(
      "http://localhost:3000/auth/logout",
      {
        method: "POST",
        credentials: "include",
        headers: {
          Cookie: "refreshToken=invalid-token",
        },
      }
    );

    if (logoutWithCookiesResponse.ok) {
      const logoutData = await logoutWithCookiesResponse.json();
      console.log("✅ Logout successful (invalid cookies)");
      console.log("📋 Response:", logoutData);
    } else {
      console.log("❌ Logout failed:", logoutWithCookiesResponse.status);
      const errorData = await logoutWithCookiesResponse.text();
      console.log("📋 Error:", errorData);
    }

    console.log("\n🎉 Logout test completed!");
    console.log("\n💡 The logout endpoint should:");
    console.log("   - Always return 200 OK");
    console.log("   - Clear the refreshToken cookie");
    console.log("   - Mark refresh tokens as revoked in database");
    console.log("   - Work even without cookies");
  } catch (error) {
    console.log("❌ Error during logout test:", error.message);
    console.log("💡 Make sure the server is running on http://localhost:3000");
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3000/health");
    if (response.ok) {
      console.log("✅ Server is running on http://localhost:3000");
      await testLogout();
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
