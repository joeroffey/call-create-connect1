// @ts-nocheck
import React, { useState } from "react";
import { View, Platform } from "react-native";
import { Canvas, useTouchHandler, useValue, Group, vec, SkPath, Path, Paint } from "@shopify/react-native-skia";
import { WebView } from "react-native-webview";

export default function DrawingScalerRN() {
  // Web fallback
  if (Platform.OS === "web") {
    return <WebView source={{ uri: "/drawing-scaler-web" }} style={{ flex: 1 }} />;
  }

  const scale = useValue(1);
  const offset = useValue(vec(0, 0));
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  const onTouch = useTouchHandler({
    onStart: ({ x, y }) => {
      setPoints((prev) => [...prev, { x, y }]);
    },
    onActive: ({ x, y }) => {
      setPoints((prev) => [...prev, { x, y }]);
    },
  });

  const path = SkPath.Make();
  points.forEach((p, i) => {
    if (i === 0) path.moveTo(p.x, p.y);
    else path.lineTo(p.x, p.y);
  });

  const paint = Paint();
  paint.setColor("white");
  paint.setStrokeWidth(2);
  paint.setStyle("stroke");

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Canvas style={{ flex: 1 }} onTouch={onTouch}>
        <Group
          transform={[{ translateX: offset.x }, { translateY: offset.y }, { scale: scale.current }]}
        >
          <Path path={path} paint={paint} />
        </Group>
      </Canvas>
    </View>
  );
}