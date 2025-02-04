import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useEffect } from "react";
import styles from "./styles";
import imagePath from "../../../constants/imagePath";
import { CustomButton, DoctorInfo } from "../../../components";
import { moderateScale, verticalScale } from "../../../styles/responsiveSize";
import navigationStrings from "../../../constants/navigationStrings";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import { useFocusEffect } from "@react-navigation/core";
import constants from "../../../constants/constants";
const Account = ({ navigation }) => {
  const [loading, setLoading] = React.useState(false);
  const [doctorInfo, setDoctorInfo] = React.useState({});

  useEffect(() => {
    getDoctorInfo();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getDoctorInfo();
    }, [])
  );

  // Getting Data from Firestore
  const getDoctorInfo = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Document data:", data.doctorInfo);
          setDoctorInfo(data.doctorInfo);
          setLoading(false);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Handler

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.replace(navigationStrings.AUTH, {
        screen: navigationStrings.LOGIN,
      });
    } catch (error) {
      console.log("Error signing out:", error);
    }
  };

  const handleOnPress = (index) => {
    switch (index) {
      case 0:
        navigation.navigate(navigationStrings.MEDICAL_TREATMENT);
        break;
      case 1:
        navigation.navigate(navigationStrings.TEMPLATES);
        break;
      case 2:
        handleSignOut();
        break;
      default:
        console.log("Pressed an item at an index other than 0 or 1");
        break;
    }
  };

  // Render

  function renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flex: 1 }}
        >
          <Image source={imagePath.icArrowLeft} style={styles.arrowStyle2} />
        </TouchableOpacity>
        <View style={{ flex: 1.5 }}>
          <Text style={styles.profileTextStyle}>Profile</Text>
        </View>
      </View>
    );
  }

  function renderProfileBox() {
    return (
      <View style={styles.profileBox}>
        <View style={styles.profileImageAndDetailCont}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: doctorInfo.imageUrl }}
              style={styles.profileStyle}
            />
          </View>
          <View>
            <Text style={styles.doctorName}>{doctorInfo.doctorName}</Text>
            <Text style={styles.emailStyle}>{doctorInfo.email}</Text>
            <View style={styles.verifiedContainer}>
              <Text style={styles.verifyTextStyle}>verified</Text>
            </View>
          </View>
        </View>
        <CustomButton
          onPress={() =>
            navigation.navigate(navigationStrings.EDIT_DOCTOR_PROFILE, {
              doctorInfo: doctorInfo,
            })
          }
          containerStyle={{
            marginTop: 0,
            borderRadius: moderateScale(10),
          }}
          label="Edit"
        />
      </View>
    );
  }

  function renderProfileOptions() {
    return (
      <View>
        {constants.profileOptions.map((item, index) => {
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleOnPress(index)}
              key={item.id}
              style={[
                styles.profileOptionsContainer,
                {
                  borderBottomWidth: index === 2 ? 0 : 0.5,
                },
              ]}
            >
              <Image
                resizeMode="contain"
                source={item.icon}
                style={styles.rightSideIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.profileOptionsText}>{item.label}</Text>
              </View>
              {index === 2 ? null : (
                <View onPress={() => handleOnPress(index)}>
                  <Image
                    source={imagePath.icRightArrow}
                    style={styles.leftSideIcon}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS == "android" && (
        <View
          style={{
            height: 15,
          }}
        />
      )}
      {renderHeader()}
      {renderProfileBox()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.container, { marginTop: verticalScale(20) }]}
      >
        {renderProfileOptions()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;
