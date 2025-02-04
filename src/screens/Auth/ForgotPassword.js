import { View, Text, SafeAreaView, Image, Alert } from "react-native";
import React, { useState } from "react";
import styles from "./styles";
import { CustomButton, CustomTextInput } from "../../components";
import colors from "../../styles/colors";
import { auth, sendPasswordResetEmail } from "../../database/firebase";
import utils from "../../utils/utils";
import navigationStrings from "../../constants/navigationStrings";
import imagePath from "../../constants/imagePath";
import { moderateScale, verticalScale } from "../../styles/responsiveSize";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  function isEnableSendEmail() {
    return email != "" && emailError == "";
  }

  // Handlers

  const sendResetEmail = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      setEmail("");
      navigation.navigate(navigationStrings.LOGIN);
      Alert.alert("Email sent successfully");
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        Alert.alert("Email not found");
        Alert.alert("Email not found");
      }
      setLoading(false);
    }
  };

  // Renderers
  const renderInputs = () => {
    return (
      <>
        <CustomTextInput
          placeholder="Email"
          value={email}
          onChangeValue={(text) => {
            utils.validateEmail(text, setEmailError);
            setEmail(text);
          }}
          placeholderTextColor={colors.gray03}
          keyboardType={"email-address"}
          capatalization={"none"}
          errorMsg={emailError}
          containerStyle={{
            height: moderateScale(50),
          }}
        />
      </>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={imagePath.icLogoOfPerigigi} style={styles.logoStyle} />
      </View>
      <Text style={styles.headingStyle}>Forgot Password</Text>
      {renderInputs()}
      <CustomButton
        disabled={isEnableSendEmail() ? false : true}
        onPress={sendResetEmail}
        label={loading ? "Loading..." : "Reset Password"}
        containerStyle={{
          marginTop: verticalScale(8),
          opacity: isEnableSendEmail() ? 1 : 0.5,
        }}
      />
    </SafeAreaView>
  );
};

export default ForgotPassword;
