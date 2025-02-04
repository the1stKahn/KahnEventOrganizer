import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React from "react";
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";

const Options = ({ icon, label, deleteStyles, labelStyle, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image source={icon} style={{ ...styles.shareIcon, ...deleteStyles }} />
      <Text style={{ ...styles.textStyle, ...labelStyle }}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: scale(20),
    marginTop: verticalScale(5),
    marginBottom: verticalScale(20),
  },
  shareIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    marginRight: scale(7),
  },
  textStyle: {
    fontSize: textScale(18),
    color: colors.black,
    marginLeft: scale(10),
  },
});

export default Options;
