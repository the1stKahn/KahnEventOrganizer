import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import imagePath from "../constants/imagePath";
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";

const TemplateNames = ({ label, onPress }) => {
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.templateTitle}
      >
        <Text style={styles.heading}>{label}</Text>

        <Image
          resizeMode="contain"
          source={imagePath.icDownArrow}
          style={styles.arrowStyle}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  templateTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: moderateScale(327),
    height: moderateScale(50),
    borderRadius: moderateScale(30),
    paddingHorizontal: scale(16),
    backgroundColor: colors.white,
    marginTop: verticalScale(20),
    alignSelf: "center",
    borderRadius: moderateScale(8),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  arrowStyle: {
    width: moderateScale(12),
    height: moderateScale(12),
  },
  heading: {
    fontSize: textScale(16),
    fontWeight: "700",
    color: colors.black,
  },
});

export default TemplateNames;
