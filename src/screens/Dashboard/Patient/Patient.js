import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";

import styles from "./styles";
import { CustomButton, CustomTextInput } from "../../../components";
import navigationStrings from "../../../constants/navigationStrings";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { moderateScale, verticalScale } from "../../../styles/responsiveSize";
import imagePath from "../../../constants/imagePath";
import colors from "../../../styles/colors";
import { useFocusEffect } from "@react-navigation/native";

const Patient = ({ navigation }) => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [dataOfPatients, setDataOfPatients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    getPatientData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getPatientData();
    }, [])
  );

  // Handlers
  const getPatientData = async () => {
    setLoadingPatients(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDataOfPatients(data.patients);
          setLoadingPatients(false);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log("Error getting user data from Firestore:", error);
      }
    } else {
      Alert.alert("No user sign in");
    }
  };

  const deletePatient = async (index) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const patients = data.patients;
          patients.splice(index, 1);
          await updateDoc(docRef, {
            patients: patients,
          });
          setDataOfPatients(patients);
          Alert.alert("Patient deleted successfully");
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log("Error getting user data from Firestore:", error);
      }
    } else {
      Alert.alert("No user sign in");
    }
  };

  const deleteAlert = (index) => {
    const patientName = dataOfPatients[index].patientName;
    Alert.alert(
      "Delete Patient",
      "Delete Message" + patientName + "?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deletePatient(index),
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item, index }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate(navigationStrings.PATIENT_PROFILE, {
            item: item,
            itemIndex: index,
          })
        }
        style={[
          styles.patientCard,
          { marginTop: index === 0 ? 0 : verticalScale(5) },
        ]}
      >
        <View style={styles.profileImageOfPatient}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.profileImageStyle}
          />
        </View>
        <View style={styles.patientNameContainer}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.dateOfBirthPlace}>{item.placeDateOfBirth}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteAlert(index)}>
        <Image
          source={imagePath.icDelete}
          style={{
            width: moderateScale(20),
            height: moderateScale(20),
            tintColor: colors.red,
          }}
        />
      </TouchableOpacity>
    </View>
  );

  const filteredDataOfPatients = dataOfPatients
    ? dataOfPatients.filter((patient) => {
        const patientName = patient.patientName.toLowerCase();
        return patientName.includes(searchValue.toLowerCase());
      })
    : [];
  // Renders

  function onRefresh() {
    setRefreshing(true);
    getPatientData();
    setRefreshing(false);
  }

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
          <Text style={styles.profileTextStyle}>Patients</Text>
        </View>
      </View>
    );
  }

  function renderSearchBar() {
    return (
      <CustomTextInput
        value={searchValue}
        onChangeValue={(text) => setSearchValue(text)}
        placeholder="Find Patient"
        placeholderTextColor={colors.gray03}
        containerStyle={styles.searchBar}
      />
    );
  }

  function renderPatientsList() {
    return (
      <>
        {loadingPatients ? (
          <View style={styles.emptyPatientContainer}>
            <ActivityIndicator size="small" color={colors.secondary} />
          </View>
        ) : filteredDataOfPatients.length === 0 ? (
          <View style={styles.emptyPatientContainer}>
            <Image
              source={imagePath.icEmptyPatient}
              style={styles.emptyPatient}
            />
            <Text style={styles.emptyPatientLine}>
              Patient Portal: Helping doctors input patient data. Understanding
              your patients better improves service quality!,
            </Text>
          </View>
        ) : (
          <View style={styles.patientsList}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredDataOfPatients}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
        )}
      </>
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
      {renderSearchBar()}
      {renderPatientsList()}
      <CustomButton
        onPress={() => navigation.navigate(navigationStrings.ADD_NEW_PATIENT)}
        label="Add new patient"
        containerStyle={{
          marginTop: verticalScale(0),
        }}
      />
    </SafeAreaView>
  );
};

export default Patient;
