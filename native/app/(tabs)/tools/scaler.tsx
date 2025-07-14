// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Canvas, Image as SkImage, useImage, useTouchHandler, Line, vec, useValue } from "@shopify/react-native-skia";
import * as Clipboard from "expo-clipboard";

const { width } = Dimensions.get("window");

export default function DrawingScaler() {
  const router = useRouter();
  const [uri, setUri] = useState<string | null>(null);
  const [scale, setScale] = useState<number | null>(null); // mm per px
  const [realLen, setReal] = useState(1000); // mm reference length (hard-coded 1m for MVP)

  const img = useImage(uri || undefined);

  const p1 = useValue(vec(0, 0));
  const p2 = useValue(vec(0, 0));
  const finished = useValue(false);

  const handler = useTouchHandler({
    onStart: ({ x, y }) => {
      finished.current = false;
      p1.current = vec(x, y);
      p2.current = vec(x, y);
    },
    onActive: ({ x, y }) => {
      p2.current = vec(x, y);
    },
    onEnd: () => {
      finished.current = true;
      const pxLen = Math.hypot(p1.current.x - p2.current.x, p1.current.y - p2.current.y);
      if (pxLen > 0) setScale(realLen / pxLen);
    },
  });

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!res.canceled) setUri(res.assets[0].uri);
  };

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}><Text className="text-emerald-400">← Back</Text></TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">Drawing Scaler</Text>
      </View>
      {!uri ? (
        <View className="flex-1 items-center justify-center">
          <TouchableOpacity onPress={pick} className="bg-emerald-500 px-6 py-3 rounded-xl"><Text className="text-white font-medium">Pick drawing</Text></TouchableOpacity>
        </View>
      ) : (
        <>
          <Canvas style={{ width, height: width }} onTouch={handler}>
            {img && <SkImage image={img} x={0} y={0} width={width} height={width} fit="contain" />}
            <Line p1={p1} p2={p2} color="cyan" strokeWidth={2} />
          </Canvas>
          <View className="px-4 py-4">
            {scale ? (
              <View>
                <Text className="text-white mb-2">Scale factor:</Text>
                <Text className="text-emerald-400 text-xl font-bold mb-4">{scale.toFixed(5)} mm / px</Text>
                <TouchableOpacity onPress={() => Clipboard.setStringAsync(scale.toFixed(5))} className="bg-gray-800 px-4 py-3 rounded-lg items-center">
                  <Text className="text-white">Copy</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-gray-400">Draw a reference line on the image to calculate scale.</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}