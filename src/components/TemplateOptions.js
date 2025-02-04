import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, Image } from "react-native";
import {
  moderateScale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";

const TemplateOptions = ({ icon, label, onPress, containerStyle }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.touchableStyle, { ...containerStyle }]}
    >
      <Image resizeMode="contain" source={icon} style={styles.smallImages} />
      <Text style={styles.templateText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  smallImages: {
    width: moderateScale(80),
    height: moderateScale(80),
  },
  templateText: {
    fontSize: textScale(14),
    fontWeight: "700",
    color: colors.black,
    paddingTop: verticalScale(5),
  },
  touchableStyle: {
    justifyContent: "center",
    alignItems: "center",
  },
});
export default TemplateOptions;
