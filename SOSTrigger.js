// SOSTrigger.js
// Handles shake + volume button SOS triggers for Suraksha app
// npm install react-native-shake react-native-volume-manager

import { useEffect } from "react";
import { Alert, Platform, AppState } from "react-native";
import RNShake from "react-native-shake";
import { VolumeManager } from "react-native-volume-manager";

// Tracks volume button pattern
let volumeHistory = [];
let lastVolumeTime = 0;
const VOLUME_WINDOW = 3000; // 3 seconds to complete pattern

const matchesPattern = (history, pattern) => {
  if (history.length < pattern.length) return false;
  const recent = history.slice(-pattern.length);
  return pattern.every((p, i) => p === recent[i]);
};

export default function SOSTrigger({ onSOS, pattern = "up-down-up" }) {
  // pattern options:
  // "up-down-up"     = Vol Up → Vol Down → Vol Up
  // "down-up-down"   = Vol Down → Vol Up → Vol Down
  // "up-up-up"       = Vol Up × 3
  // "down-down-down" = Vol Down × 3

  const patternMap = {
    "up-down-up":     ["up",   "down", "up"],
    "down-up-down":   ["down", "up",   "down"],
    "up-up-up":       ["up",   "up",   "up"],
    "down-down-down": ["down", "down", "down"],
  };

  const selectedPattern = patternMap[pattern] || patternMap["up-down-up"];

  const triggerSOS = () => {
    Alert.alert(
      "🚨 SOS Triggered",
      "Emergency alert is being sent to your contacts.",
      [{ text: "Cancel", style: "cancel" }, { text: "Send Now", onPress: onSOS }]
    );
  };

  useEffect(() => {
    // ── Shake Detection ──────────────────────────────────
    const shakeSub = RNShake.addListener(() => {
      triggerSOS();
    });

    // ── Volume Button Detection ──────────────────────────
    let prevVolume = null;
    const volumeSub = VolumeManager.addVolumeListener((result) => {
      const now = Date.now();
      const current = result.volume;

      if (prevVolume === null) { prevVolume = current; return; }

      const direction = current > prevVolume ? "up" : "down";
      prevVolume = current;

      // Reset history if too much time passed
      if (now - lastVolumeTime > VOLUME_WINDOW) volumeHistory = [];
      lastVolumeTime = now;

      volumeHistory.push(direction);

      // Keep only last 5 presses
      if (volumeHistory.length > 5) volumeHistory.shift();

      // Check if pattern matched
      if (matchesPattern(volumeHistory, selectedPattern)) {
        volumeHistory = [];
        triggerSOS();
      }
    });

    return () => {
      shakeSub.remove();
      volumeSub.remove();
    };
  }, [pattern]);

  return null; // no UI, runs in background
}
