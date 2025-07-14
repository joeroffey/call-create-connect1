// @ts-nocheck
import React from "react";
import { useLocalSearchParams } from "expo-router";
import BrickCalculatorRN from "../../components/tools/BrickCalculatorRN";

export default function ToolScreen() {
  const { tool } = useLocalSearchParams();
  if (tool === "brick") return <BrickCalculatorRN />;
  if (tool === "timber") {
    const TimberCalc = require("../../components/tools/TimberCalculatorRN").default;
    return <TimberCalc />;
  }
  return null;
}