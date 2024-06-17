const functions = require("firebase-functions");
const fetch = require("node-fetch");
const admin = require("firebase-admin");

const account = require("./esp32-car-data-firebase-adminsdk-mqj0m-d55b5c39f4.json");

admin.initializeApp({
  credential: admin.credential.cert(account),
  databaseURL: "https://esp32-car-data-default-rtdb.firebaseio.com",
});

// Constants for battery level notification
const MAX_VOLTAGE = 9.2;
const MIN_VOLTAGE = 6.0;

/**
 * Calculates the battery percentage from the voltage.
 *
 * @param {number} voltage - The voltage value.
 * @return {number} - The calculated battery percentage.
 */
function calculateBatteryPercentage(voltage) {
  const percentage = ((voltage - MIN_VOLTAGE) / (MAX_VOLTAGE - MIN_VOLTAGE)) * 100;
  return Math.min(100, Math.max(0, percentage)).toFixed(0);
}

/**
 * Sends a push notification for battery status.
 *
 * @param {string} expoPushToken - The Expo push token.
 * @param {number} batteryLevel - The current battery level.
 * @param {string} status - The status of the battery ('full' or 'low').
 * @return {Promise<void>}
 */
async function sendBatteryNotification(expoPushToken, batteryLevel, status) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: status === "full" ? "Battery Fully Charged" : "Low Battery Warning",
    body: status === "full" ?
      "Your battery is now fully charged." :
      "Your battery level is very low. Please recharge soon!",
    data: {batteryLevel: `${batteryLevel}`},
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log("Expo push notification response:", data);

    if (data.errors) {
      console.error("Expo push notification error:", data.errors);
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

/**
 * Cloud Function to send a push notification when the battery level is 100% or 10%.
 */
exports.batteryLevelNotification = functions.database.ref("/sensors/vBatt")
    .onUpdate(async (change, context) => {
      const after = change.after.val();
      const before = change.before.val();

      if (after == null) {
        console.error(`Battery voltage value is null or undefined`);
        return null;
      }

      if (before === after) {
        console.log(`Battery voltage didn't change!`);
        return null;
      }

      console.log(`Battery voltage updated: ${after}`);

      const batteryPercentage = calculateBatteryPercentage(after);
      console.log(`Calculated battery percentage: ${batteryPercentage}`);

      const expoPushToken = (await admin.database().ref("/token").once("value")).val();
      if (!expoPushToken) {
        console.error("Expo push token not found");
        return null;
      }

      const notificationRef = admin.database().ref("/notification");

      // Reset notification flags if battery percentage moves away from critical levels
      if (batteryPercentage < 100) {
        await notificationRef.child("batteryFull").set(false);
      }
      if (batteryPercentage > 10) {
        await notificationRef.child("batteryLow").set(false);
      }

      if (batteryPercentage == 100) {
        const fullNotificationSent = (await notificationRef.child("batteryFull").once("value")).val();
        if (!fullNotificationSent) {
          await sendBatteryNotification(expoPushToken, batteryPercentage, "full");
          console.log("Battery full notification sent successfully");
          await notificationRef.child("batteryFull").set(true);
        } else {
          console.log("Battery full notification already sent");
        }
      } else if (batteryPercentage <= 10) {
        const lowNotificationSent = (await notificationRef.child("batteryLow").once("value")).val();
        if (!lowNotificationSent) {
          await sendBatteryNotification(expoPushToken, batteryPercentage, "low");
          console.log("Low battery notification sent successfully");
          await notificationRef.child("batteryLow").set(true);
        } else {
          console.log("Low battery notification already sent");
        }
      }

      return null;
    });

const CRITICAL_THRESHOLD = 50;
const WARNING_THRESHOLD = 35;
const TEMP_MIN_INTERVAL = 10 * 60 * 1000; // 10 minutes

/**
 * Sends a push notification for temperature status.
 *
 * @param {string} expoPushToken - The Expo push token.
 * @param {number} tBatt1 - The value of tBatt1.
 * @param {number} tBatt2 - The value of tBatt2.
 * @param {string} level - The level of the notification ('warning' or 'critical').
 * @return {Promise<void>}
 */
async function sendPushNotification(expoPushToken, tBatt1, tBatt2, level) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: level === "critical" ? "Critical Temperature Alert" : "Warning Temperature Alert",
    body: `Your battery has exceeded the ${level} temperature limit`,
    data: {tBatt1: `${tBatt1}`, tBatt2: `${tBatt2}`},
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log("Expo push notification response:", data);

    if (data.errors) {
      console.error("Expo push notification error:", data.errors);
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

/**
 * Determines the current temperature level.
 *
 * @param {number} tBatt1 - The value of tBatt1.
 * @param {number} tBatt2 - The value of tBatt2.
 * @return {string} - The current level ('normal', 'warning', 'critical').
 */
function determineCurrentLevel(tBatt1, tBatt2) {
  if (tBatt1 >= CRITICAL_THRESHOLD || tBatt2 >= CRITICAL_THRESHOLD) {
    return "critical";
  } else if (tBatt1 >= WARNING_THRESHOLD || tBatt2 >= WARNING_THRESHOLD) {
    return "warning";
  } else {
    return "normal";
  }
}

/**
 * Cloud Function to send a push notification when temperature exceeds the threshold.
 */
exports.temperatureNotification = functions.database.ref("/sensors/{sensorId}")
    .onUpdate(async (change, context) => {
      const sensorId = context.params.sensorId;
      const after = change.after.val();
      const before = change.before.val();

      if (after == null) {
        console.error(`Sensor ${sensorId} value is null or undefined`);
        return null;
      }

      if (before === after) {
        console.log(`Value of temperature sensor ${sensorId} didn't change!`);
        return null;
      }

      console.log(`Sensor ${sensorId} updated value: ${after}`);

      let tBatt1;
      let tBatt2;
      try {
        if (sensorId === "tBatt1") {
          tBatt1 = after;
          const tBatt2Snapshot = await admin.database().ref("/sensors/tBatt2").once("value");
          tBatt2 = tBatt2Snapshot.val();
        } else if (sensorId === "tBatt2") {
          tBatt2 = after;
          const tBatt1Snapshot = await admin.database().ref("/sensors/tBatt1").once("value");
          tBatt1 = tBatt1Snapshot.val();
        } else {
          console.error(`Unknown sensor ID: ${sensorId}`);
          return null;
        }
      } catch (error) {
        console.error(`Error fetching the other sensor value: ${error}`);
        return null;
      }

      console.log(`Extracted values - tBatt1: ${tBatt1}, tBatt2: ${tBatt2}`);

      const lastNotificationSnapshot = await admin.database().ref("/notification").once("value");
      const lastNotification = lastNotificationSnapshot.val() || {};
      const lastLevel = lastNotification.level || "normal";
      const lastTimestamp = lastNotification.timestamp || 0;
      const currentTime = Date.now();

      const currentLevel = determineCurrentLevel(tBatt1, tBatt2);

      const shouldSendNotification = (
        ((currentLevel !== "normal") && (currentLevel !== lastLevel)) ||
      (currentTime - lastTimestamp > TEMP_MIN_INTERVAL)
      );

      if (shouldSendNotification) {
        const expoPushToken = (await admin.database().ref("/token").once("value")).val();
        if (!expoPushToken) {
          console.error("Expo push token not found");
          return null;
        }

        await sendPushNotification(expoPushToken, tBatt1, tBatt2, currentLevel);
        console.log("Notification sent successfully");
      } else {
        console.log("No notification sent");
      }

      await admin.database().ref("/notification").update({
        level: currentLevel,
        timestamp: currentTime,
      });

      return null;
    });
