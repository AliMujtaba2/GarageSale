import React, { useState } from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";

const RangeCalendar = ({  range = { start: null, end: null }, setRange ,setMode }) => {


    const onDayPress = (day) => {
    // If start is not set OR both start & end are already set → start fresh
    if (!range.start || (range.start && range.end)) {
      setRange({ start: day.dateString, end: null });
      setMode("single");
      
    } else {
      // Second click → select end date
      setRange({ ...range, end: day.dateString });
      setMode("range");
    }
  };


  const getMarkedDates = () => {
    if (!range.start) return {};

    let marked = {
      [range.start]: { startingDay: true, color: "#50cebb", textColor: "white" }
    };

    if (range.end) {
      let start = new Date(range.start);
      let end = new Date(range.end);

      // Handle backward selection (end before start)
      if (end < start) {
        [start, end] = [end, start];
      }

      let current = new Date(start);
      while (current <= end) {
        const dateString = current.toISOString().split("T")[0];

        if (dateString === range.start) {
          marked[dateString] = {
            startingDay: true,
            color: "#50cebb",
            textColor: "white",
          };
        } else if (dateString === range.end) {
          marked[dateString] = {
            endingDay: true,
            color: "#50cebb",
            textColor: "white",
          };
        } else {
          marked[dateString] = { color: "#70d7c7", textColor: "white" };
        }

        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  return (
    <View>
      <Calendar
        onDayPress={onDayPress}
        markingType={"period"}
        markedDates={getMarkedDates()}
      />
    </View>
  );
};

export default RangeCalendar;
