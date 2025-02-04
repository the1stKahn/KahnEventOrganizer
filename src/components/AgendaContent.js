import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";
import imagePath from "../constants/imagePath";

const AgendaContent = ({
  label,
  time,
  containerStyle,
  onPressEdit,
  onPressDelete,
}) => {
  return (
    <View style={[styles.appointmentsTimings, { ...containerStyle }]}>
      <Image
        resizeMode="contain"
        source={imagePath.icBlueDot}
        style={styles.blueDot}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.schedule}>{label}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.editRemoveContainer}>
        <TouchableOpacity onPress={onPressEdit}>
          <Image source={imagePath.icEditIcon} style={styles.editIconStyle} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressDelete}>
          <Image
            source={imagePath.icDelete}
            style={[
              styles.editIconStyle,
              {
                tintColor: colors.red,
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentsTimings: {
    marginHorizontal: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(16),
    borderBottomWidth: 1,
    borderColor: colors.gray02,
    height: moderateScale(60),
  },
  blueDot: {
    width: scale(16),
    height: scale(16),
  },
  schedule: {
    fontSize: textScale(16),
    color: colors.black,
    marginLeft: scale(16),
    fontWeight: "500",
  },
  time: {
    fontSize: textScale(14),
    color: colors.black,
    fontWeight: "400",
  },
  editRemoveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editIconStyle: {
    width: scale(14),
    height: scale(14),
    marginLeft: scale(16),
  },
});

export default AgendaContent;
