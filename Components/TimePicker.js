import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DatePicker from "react-native-date-picker";


const TimeRangePicker = ({ fromTime, toTime, setFromTime, setToTime }) => {


  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);


  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>From:</Text>
      {/* From Time Picker */}
      <TouchableOpacity style={styles.btn} onPress={() => setOpenFrom(true)}>
        <Text style={styles.btnText}> {fromTime instanceof Date
          ? fromTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-- : --"}</Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={openFrom}
        date={fromTime instanceof Date ? fromTime : new Date()}
        mode="time"
        theme="light"
        onConfirm={(date) => {
          setOpenFrom(false);
          setFromTime(date);
          console.log("✅ FROM TIME PICKED:", date.toLocaleTimeString());
        }}
        onCancel={() => setOpenFrom(false)}
      />
      {/* To Time Picker */}
      <Text style={styles.timeText}>
        To:</Text>
      <TouchableOpacity style={styles.btn} onPress={() => setOpenTo(true)}>
        <Text style={styles.btnText}>
          {toTime instanceof Date
            ? toTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "-- : --"}</Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={openTo}
        date={toTime instanceof Date ? toTime : new Date()}
        mode="time"
        theme="light"
        onDateChange={(newTime) => setToTime(newTime)}
        onConfirm={(date) => {
          setOpenTo(false);
          setToTime(date);
          console.log("✅ TO TIME PICKED:", date.toLocaleTimeString());
        }}
        onCancel={() => setOpenTo(false)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  btn: {
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  timeText: {
    top: -35,
    marginVertical: 6,
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },
  rangeBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#E6E6FA",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  rangeTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#4B0082",
  },
  rangeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default TimeRangePicker;
