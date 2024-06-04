const functions = require("firebase-functions");
const fetch = require("node-fetch");
const admin = require("firebase-admin");

const account = require("./esp32-car-data-firebase-adminsdk-mqj0m-d55b5c39f4.json");

admin.initializeApp({
  credential: admin.credential.cert(account),
  databaseURL: "https://esp32-car-data-default-rtdb.firebaseio.com",
});

const WARNING_THRESHOLD = 40;
const CRITICAL_THRESHOLD = 50;
const MIN_INTERVAL = 10 * 60 * 1000; // 10 minutes

/**
 * Sends a push notification using the Expo Push API.
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

      // Exit if the new value is null or undefined
      if (after == null) {
        console.error(`Sensor ${sensorId} value is null or undefined`);
        return null;
      }

      // Check if the value actually changed
      if (before === after) {
        console.log(`Value of temperature sensor ${sensorId} didn't change!`);
        return null;
      }

      console.log(`Sensor ${sensorId} updated value: ${after}`);

      // Determine which sensor has been updated and fetch the other value
      let tBatt1; let tBatt2;
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

      // Fetch the last notification level and timestamp
      const lastNotificationSnapshot = await admin.database().ref("/notification").once("value");
      const lastNotification = lastNotificationSnapshot.val() || {};
      const lastLevel = lastNotification.level || "normal";
      const lastTimestamp = lastNotification.timestamp || 0;
      const currentTime = Date.now();

      // Determine the current level
      const currentLevel = determineCurrentLevel(tBatt1, tBatt2);

      // Decide whether to send a notification
      const shouldSendNotification = (
        (currentLevel !== lastLevel) ||
      (currentLevel !== "normal" && (currentTime - lastTimestamp > MIN_INTERVAL))
      );

      if (shouldSendNotification) {
        const expoPushToken = (await admin.database().ref("/token").once("value")).val();
        if (!expoPushToken) {
          console.error("Expo push token not found");
          return null;
        }

        await sendPushNotification(expoPushToken, tBatt1, tBatt2, currentLevel);
        console.log("Notification sent successfully");

        // Update the last notification details
        await admin.database().ref("/notification").set({
          level: currentLevel,
          timestamp: currentTime,
        });
      } else {
        console.log("No notification sent");
      }

      return null;
    });
