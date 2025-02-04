import { View, Text, SafeAreaView, Image } from "react-native";
import React from "react";
import styles from "./styles";
import imagePath from "../../constants/imagePath";
import { CustomButton } from "../../components";
import navigationStrings from "../../constants/navigationStrings";
import { textScale, verticalScale } from "../../styles/responsiveSize";

const Confirmation = ({ navigation }) => {
  // Renderers

  const renderSuccessMessage = () => {
    return (
      <View style={styles.successMessageContainer}>
        <Text style={[styles.headingStyle, { fontSize: textScale(35) }]}>
          Check your email inbox
        </Text>
        <Text style={styles.thankuNote}>
          We have sent a confirmation email. Please check your spam folder if
          the email is not in your inbox.
        </Text>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          resizeMode="contain"
          source={imagePath.icChecked}
          style={styles.logoStyle}
        />
      </View>
      {renderSuccessMessage()}
      <CustomButton
        containerStyle={{
          marginTop: verticalScale(8),
        }}
        label="Sign In"
        onPress={() => navigation.navigate(navigationStrings.LOGIN)}
      />
    </SafeAreaView>
  );
};

export default Confirmation;
