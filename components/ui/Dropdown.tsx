import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Option = { label: string; value: string };
export default function Dropdown({
  value,
  onChange,
  placeholder = "Select...",
  options = [],
  width = "100%",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: Option[];
  width?: any;
}) {
  const [open, setOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    setOpen(!open);
    Animated.timing(fadeAnim, {
      toValue: open ? 0 : 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // AUTO CLOSE - CHỈ WEB CHẠY
  useEffect(() => {
    if (Platform.OS !== "web") return; // ⛔ MOBILE DỪNG TẠI ĐÂY

    const close = () => setOpen(false);

    if (open) {
      document.addEventListener("click", close);
    }

    return () => {
      document.removeEventListener("click", close);
    };
  }, [open]);

  return (
    <View style={{ width, position: "relative" }}>
      {/* SELECT BOX */}
      <TouchableOpacity
        onPress={(e) => {
          if (Platform.OS === "web") {
            e.stopPropagation(); // chỉ web dùng
          }
          toggle();
        }}
        style={styles.selectBox}
      >
        <Text style={styles.selectText}>
          {value ? options.find((o) => o.value === value)?.label : placeholder}
        </Text>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#444"
        />
      </TouchableOpacity>

      {/* DROPDOWN */}
      {open && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-5, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={({ hovered }) => [
                styles.item,
                {
                  backgroundColor:
                    opt.value === value
                      ? "#eee"
                      : hovered && Platform.OS === "web"
                      ? "#f5f5f5"
                      : "white",
                },
              ]}
            >
              <Text style={styles.itemText}>{opt.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    borderRadius: 12,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  selectText: {
    fontSize: 15,
    color: "#222",
  },

  dropdown: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,

    zIndex: 9999,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  itemText: {
    fontSize: 15,
    color: "#111",
  },
});
