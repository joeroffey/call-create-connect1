import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.eezybuild.app",
  appName: "EezyBuild",
  webDir: "dist",
  plugins: {
    Keyboard: {
      resize: "body",
      style: "light",
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      backgroundColor: "#000000",
    },
  },
};

export default config;
