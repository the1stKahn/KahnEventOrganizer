import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";

const DoctorInfo = ({ label, image }) => {
  return (
    <View style={styles.contentOfDoctor}>
      <Image resizeMode="contain" source={image} style={styles.iconStyle} />
      <Text style={styles.labelStyle}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  contentOfDoctor: {
    flexDirection: "row",
    marginHorizontal: scale(15),
    marginVertical: verticalScale(12),
    alignItems: "center",
  },
  iconStyle: {
    width: moderateScale(30),
    height: moderateScale(30),
  },
  labelStyle: {
    fontSize: textScale(20),
    fontWeight: "500",
    color: colors.black,
    paddingLeft: scale(15),
  },
});

export default DoctorInfo;
