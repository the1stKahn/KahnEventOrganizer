import { View, Text, Image, ActivityIndicator, Platform } from "react-native";
import React, { useEffect } from "react";
import imagePath from "../../../constants/imagePath";
import { DoctorInfo } from "../../../components";
import { verticalScale } from "../../../styles/responsiveSize";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import { useFocusEffect } from "@react-navigation/core";
import styles from "./styles";
const MyInformation = () => {
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

  // Render

  function renderBox() {
    return (
      <View style={styles.box}>
        <Text
          style={styles.doctorName2}
        >{`Dokter ${doctorInfo.doctorName}`}</Text>
        <View style={styles.profileImageContainer}>
          {doctorInfo.imageUrl && doctorInfo.imageUrl !== "" ? (
            <Image
              source={{ uri: doctorInfo.imageUrl }}
              style={styles.profileStyle2}
            />
          ) : (
            <Image
              source={imagePath.icDefaultProfile}
              style={styles.profileStyle2}
            />
          )}
        </View>
      </View>
    );
  }

  function renderDoctorDetails() {
    return (
      <View style={styles.doctorDetailContainer}>
        <DoctorInfo image={imagePath.icPhone} label={doctorInfo.phoneNumber} />
        <DoctorInfo image={imagePath.icMail} label={doctorInfo.email} />
        <DoctorInfo image={imagePath.icStr} label={doctorInfo.str} />
        <DoctorInfo image={imagePath.icSip} label={doctorInfo.sip} />
        <DoctorInfo image={imagePath.icHome} label={doctorInfo.homeAddress} />
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
    <View style={styles.container}>
      {Platform.OS == "android" && (
        <View
          style={{
            height: 15,
          }}
        />
      )}
      {renderBox()}
      <View style={[styles.container, { marginTop: verticalScale(90) }]}>
        {renderDoctorDetails()}
      </View>
    </View>
  );
};

export default MyInformation;
