// @ts-nocheck
import React, { useState } from "react";
import { View, Image, TouchableOpacity, FlatList, Modal } from "react-native";

interface Img {
  url: string;
  title?: string;
  source?: string;
}

export default function ImageGalleryRN({ images }: { images: Img[] }) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  const open = (i: number) => {
    setIndex(i);
    setVisible(true);
  };

  return (
    <View className="my-2">
      <FlatList
        horizontal
        data={images}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item, index: i }) => (
          <TouchableOpacity onPress={() => open(i)} className="mr-2">
            <Image
              source={{ uri: item.url }}
              className="w-24 h-24 rounded-lg"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
      <Modal visible={visible} transparent={true} onRequestClose={() => setVisible(false)}>
        <TouchableOpacity className="flex-1 bg-black items-center justify-center" onPress={() => setVisible(false)}>
          <Image source={{ uri: images[index].url }} className="w-full h-full" resizeMode="contain" />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}