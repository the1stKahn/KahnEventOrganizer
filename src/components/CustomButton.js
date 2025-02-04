import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";
import {
  moderateScale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";

const CustomButton = ({
  onPress,
  containerStyle,
  label,
  labelStyle,
  disabled,
  loading,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, { ...containerStyle }]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text style={[styles.textStyle, { ...labelStyle }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(39),
    marginBottom: verticalScale(10),
    height: moderateScale(50),
    borderRadius: moderateScale(100),
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: moderateScale(16),
  },
  textStyle: {
    fontSize: textScale(16),
    fontFamily: "Inter-Regular",
    color: colors.white,
    fontWeight: "600",
  },
});

export default CustomButton;
