import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  DimensionValue,
  Modal,
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
  width?: number | string; // allow "100%"
}) {
  const [open, setOpen] = useState(false);

  /** Convert width into correct DimensionValue */
  const resolvedWidth: DimensionValue = typeof width === "number" ? width : (width as DimensionValue);

  return (
    <View style={{ width: resolvedWidth }}>
      {/* SELECT BOX */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.selectBox}
        activeOpacity={0.8}
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

      {/* DROPDOWN PORTAL */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.dropdownContainer, { width: resolvedWidth }]}>
            {options.map((opt) => {
              const isActive = opt.value === value;

              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={({ hovered }) => [
                    styles.item,
                    {
                      backgroundColor: isActive
                        ? "#EEE"
                        : hovered && Platform.OS === "web"
                        ? "#F5F5F5"
                        : "white",
                    },
                  ]}
                >
                  <Text style={styles.itemText}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  dropdownContainer: {
    maxHeight: "50%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },

  itemText: {
    fontSize: 15,
    color: "#111",
  },
});
