import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { moderateScale, scale, verticalScale } from "../styles/responsiveSize";
import colors from "../styles/colors";
import CustomTextInput from "./CustomTextInput";

const PatientInformation = ({
  label,
  icon,
  containerStyle,
  text,
  onChangeText,
  keyboardType,
  editable,
  sideIconTrue,
  phoneError,
  sideIcon,
  sideIconPress,
}) => {
  return (
    <>
      <View style={[styles.patientInformationBox, { ...containerStyle }]}>
        <Image resizeMode="contain" source={icon} style={styles.iconStyle} />
        <CustomTextInput
          editable={editable}
          keyboardType={keyboardType}
          value={text}
          onChangeValue={onChangeText}
          placeholder={label}
          containerStyle={styles.containerStyle}
        />
        {sideIconTrue && (
          <TouchableOpacity onPress={sideIconPress}>
            <Image
              resizeMode="contain"
              source={sideIcon}
              style={styles.arrowing}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={{
          color: colors.red,
          marginRight: scale(25),
          textAlign: "right",
          paddingTop: verticalScale(5),
        }}
      >
        {phoneError}
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  patientInformationBox: {
    marginHorizontal: scale(25),
    marginTop: verticalScale(20),
    backgroundColor: colors.white,
    flexDirection: "row",
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderColor: colors.gray02,
    alignItems: "center",
  },
  iconStyle: {
    width: scale(20),
    height: verticalScale(20),
  },
  containerStyle: {
    backgroundColor: "transparent",
    borderWidth: 0,
    width: scale(290),
    height: moderateScale(50),
    marginTop: verticalScale(20),
  },
  arrowing: {
    width: moderateScale(14),
    height: moderateScale(14),
  },
});

export default PatientInformation;
