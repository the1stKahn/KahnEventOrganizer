import { Text, TouchableOpacity, View, Image, Alert } from "react-native";
import React, { useState } from "react";
import styles from "./styles";
import { CustomButton, CustomTextInput } from "../../components";
import colors from "../../styles/colors";
import navigationStrings from "../../constants/navigationStrings";
import { auth, db, signInWithEmailAndPassword } from "../../database/firebase";
import imagePath from "../../constants/imagePath";
import { doc, getDoc } from "firebase/firestore";
import { moderateScale, verticalScale } from "../../styles/responsiveSize";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      if (email === "" || password === "") {
        Alert.alert("All fields are required");
        return;
      }

      setLoading(true);
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      if (data?.isProfileCreated === "true") {
        navigation.navigate(navigationStrings.MAIN, {
          screen: navigationStrings.TAB_NAVIGATION,
        });
      } else {
        navigation.replace(navigationStrings.MAIN, {
          screen: navigationStrings.CREATE_PROFILE,
          params: { emailOfDoctor: user.email },
        });
      }

      setEmail("");
      setPassword("");
    } catch (error) {
      setLoading(false);

      if (error.code === "auth/user-not-found") {
        Alert.alert("No account found with the provided information.");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Wrong password or email.");
      } else {
        Alert.alert("An unexpected error occurred. Please try again.");
      }
    } finally {
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
          onChangeValue={(text) => setEmail(text)}
          placeholderTextColor={colors.gray03}
          keyboardType={"email-address"}
          capatalization={"none"}
          containerStyle={{
            marginTop: verticalScale(20),
            height: moderateScale(50),
          }}
        />
        <CustomTextInput
          placeholder="Password"
          value={password}
          onChangeValue={(text) => setPassword(text)}
          placeholderTextColor={colors.gray03}
          secureEntry={showPassword ? false : true}
          showIcon={true}
          containerStyle={{
            marginTop: 0,
            height: moderateScale(50),
          }}
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
        Please sign in to access your account
      </Text>

      {renderInputs()}
      <TouchableOpacity
        style={styles.forgotPasswordContainer}
        onPress={() => navigation.navigate(navigationStrings.FORGOT_PASSWORD)}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password</Text>
      </TouchableOpacity>
      <CustomButton
        disabled={email !== "" && password !== "" ? false : true}
        onPress={onLogin}
        label="Sign in"
        loading={loading}
        containerStyle={{
          marginTop: verticalScale(8),
          opacity: email !== "" && password !== "" ? 1 : 0.5,
        }}
      />
      <View style={styles.dontHaveAnAccountContainer}>
        <Text style={styles.textOfDontHaveAnAccount}>
          Don't have an account?
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(navigationStrings.REGISTER)}
        >
          <Text style={styles.textOfSignUp}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Login;
