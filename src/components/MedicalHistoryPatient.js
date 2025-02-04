import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { moderateScale, scale, textScale } from "../styles/responsiveSize";
import colors from "../styles/colors";
import imagePath from "../constants/imagePath";

const MedicalHistoryPatient = ({
  containerStyle,
  sentence,
  reportContainerStyle,
  key,
  index,
  onPressModal,
}) => {
  return (
    <View style={[styles.container, { ...containerStyle }]}>
      <TouchableOpacity
        activeOpacity={0.1}
        key={key}
        onPress={onPressModal}
        style={[styles.reportContainer, { ...reportContainerStyle }]}
      >
        <Text style={styles.counting}>{index + 1}:</Text>
        <View
          style={{
            flex: 1,
            paddingHorizontal: scale(10),
          }}
        >
          <Text style={styles.sentence}>{sentence}</Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity activeOpacity={0.8}>
            <Image source={imagePath.icDots} style={styles.shareIcon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  reportContainer: {
    height: moderateScale(48),
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
  },
  iconStyle: {
    width: moderateScale(25),
    height: moderateScale(25),
  },
  sentence: {
    fontSize: textScale(14),
    color: colors.black,
  },
  shareIcon: {
    width: moderateScale(16),
    height: moderateScale(16),
    marginRight: scale(7),
  },
  counting: {
    fontSize: textScale(14),
    color: colors.black,
    fontWeight: "bold",
  },
  modalStyle: {
    width: moderateScale(70),
    height: moderateScale(30),
    backgroundColor: colors.white,
    borderRadius: moderateScale(10),
    position: "absolute",
    shadowColor: colors.black,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    top: moderateScale(20),
    right: moderateScale(10),
    overflow: "hidden",
    zIndex: 1,
  },
});

export default MedicalHistoryPatient;
