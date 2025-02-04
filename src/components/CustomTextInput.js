import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import React from "react";
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from "../styles/responsiveSize";
import colors from "../styles/colors";

const CustomTextInput = ({
  editable,
  containerStyle,
  placeholder,
  value,
  onChangeValue,
  secureEntry,
  inputStyle,
  placeholderTextColor,
  miniText,
  showPassword,
  keyboardType,
  errorMsg,
  capatalization,
  icon,
  showIcon,
  multiline,
  iconStylesInTextInput,
}) => {
  return (
    <View>
      <View style={[styles.container, { ...containerStyle }]}>
        <TextInput
          editable={editable}
          multiline={multiline}
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeValue}
          secureTextEntry={secureEntry}
          style={[styles.textInputStyle, { ...inputStyle }]}
          placeholderTextColor={placeholderTextColor}
          keyboardType={keyboardType}
          autoCapitalize={capatalization}
        />
        {showIcon && (
          <TouchableOpacity style={styles.eyeContainer} onPress={showPassword}>
            <Image
              source={icon}
              style={[styles.eyeStyle, { ...iconStylesInTextInput }]}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.errorText}>{errorMsg}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    // height: moderateScale(50),
    paddingVertical: Platform.OS === "ios" ? moderateScale(10) : 0,
    paddingHorizontal: moderateScale(16),
    width: moderateScale(343),
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: colors.gray02,
    backgroundColor: colors.white,
    alignSelf: "center",
    marginTop: verticalScale(32),
    alignItems: "center",
  },
  textInputStyle: {
    flex: 1,
    fontSize: textScale(16),
    fontFamily: "Inter-Regular",
    color: colors.textBlack,
    borderRadius: moderateScale(10),
  },

  errorText: {
    color: colors.red,
    fontSize: moderateScale(12),
    textAlign: "right",
    paddingRight: scale(24),
    paddingTop: verticalScale(8),
  },
  eyeStyle: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  eyeContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: scale(16),
  },
});

export default CustomTextInput;
