import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, Image } from "react-native";
import {
  moderateScale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";
import imagePath from "../constants/imagePath";

const TemplateOptions2 = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.touchableStyle}
    >
      <Image resizeMode="contain" source={icon} style={styles.smallImages} />
      <View style={{ flex: 1 }}>
        <Text style={styles.templateText}>{label}</Text>
      </View>
      <Image
        source={imagePath.icRightArrow}
        style={{ width: moderateScale(20), height: moderateScale(20) }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  smallImages: {
    width: moderateScale(30),
    height: moderateScale(30),
  },
  templateText: {
    fontSize: textScale(16),
    fontWeight: "700",
    color: colors.black,
    paddingTop: verticalScale(5),
    paddingLeft: moderateScale(15),
  },
  touchableStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(10),
    marginHorizontal: moderateScale(10),
  },
});
export default TemplateOptions2;
