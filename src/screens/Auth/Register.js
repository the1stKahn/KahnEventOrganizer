import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState } from "react";
import styles from "./styles";
import { CustomButton, CustomTextInput } from "../../components";
import colors from "../../styles/colors";
import navigationStrings from "../../constants/navigationStrings";
import { moderateScale, verticalScale } from "../../styles/responsiveSize";
import utils from "../../utils/utils";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "../../database/firebase";
import { doc, setDoc } from "firebase/firestore";
import imagePath from "../../constants/imagePath";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const Register = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handlers

  const registerUser = async () => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userData = {
        fullName,
        phone,
        userId: user.uid,
        isProfileCreated: "false",
      };

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), userData);
      await sendEmailVerification(user);
      setLoading(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setPassword("");
      Alert.alert("You are already registered. Please verify your email.");
      navigation.navigate(navigationStrings.CONFIRMATION);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setEmailError("This email is already in use.");
      }
      setLoading(false);
    }
  };

  // Renderers

  function isEnableSignUp() {
    return (
      email != "" &&
      fullName != "" &&
      password != "" &&
      phone != "" &&
      emailError == "" &&
      fullNameError == "" &&
      passwordError == "" &&
      phoneError == ""
    );
  }

  const renderInputs = () => {
    return (
      <>
        <CustomTextInput
          placeholder="Full Name"
          value={fullName}
          onChangeValue={(text) => setFullName(text)}
          placeholderTextColor={colors.gray03}
          containerStyle={{
            height: moderateScale(50),
          }}
        />
        <CustomTextInput
          placeholder="Phone Number"
          value={phone}
          onChangeValue={(text) => {
            utils.validatePhoneNumber(text, setPhoneError);
            setPhone(text);
          }}
          placeholderTextColor={colors.gray03}
          containerStyle={{
            marginTop: 0,
            height: moderateScale(50),
          }}
          keyboardType={"numeric"}
          errorMsg={phoneError}
        />
        <CustomTextInput
          placeholder="Email"
          value={email}
          onChangeValue={(text) => {
            utils.validateEmail(text, setEmailError);
            setEmail(text);
          }}
          placeholderTextColor={colors.gray03}
          containerStyle={{
            marginTop: 0,
            height: moderateScale(50),
          }}
          keyboardType={"email-address"}
          errorMsg={emailError}
          capatalization={"none"}
        />
        <CustomTextInput
          placeholder="Password"
          value={password}
          onChangeValue={(text) => {
            utils.validatePassword(text, setPasswordError);
            setPassword(text);
          }}
          errorMsg={passwordError}
          placeholderTextColor={colors.gray03}
          secureEntry={showPassword ? false : true}
          containerStyle={{
            marginTop: 0,
            height: moderateScale(50),
          }}
          showIcon={true}
          icon={showPassword ? imagePath.icView : imagePath.icHide}
          showPassword={() => setShowPassword(!showPassword)}
        />
      </>
    );
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image source={imagePath.icLogoOfPerigigi} style={styles.logoStyle} />
      </View>
      <Text style={styles.headingStyle}>
        Sign up here to create your account
      </Text>

      {renderInputs()}
      <CustomButton
        disabled={isEnableSignUp() ? false : true}
        onPress={registerUser}
        containerStyle={{
          marginTop: verticalScale(8),
          opacity: isEnableSignUp() ? 1 : 0.5,
        }}
        label="Sign up"
        loading={loading}
      />
      <View style={styles.dontHaveAnAccountContainer}>
        <Text style={styles.textOfDontHaveAnAccount}>
          Already have an account?
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(navigationStrings.LOGIN)}
        >
          <Text style={styles.textOfSignUp}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Register;
