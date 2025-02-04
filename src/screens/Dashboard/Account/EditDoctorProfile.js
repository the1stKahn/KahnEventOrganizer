import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "../../Auth/styles";
import imagePath from "../../../constants/imagePath";
import colors from "../../../styles/colors";
import { verticalScale } from "../../../styles/responsiveSize";
import { CustomButton, PatientInformation } from "../../../components";
import Modal from "react-native-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { auth, db, storage } from "../../../database/firebase";
import { doc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import navigationStrings from "../../../constants/navigationStrings";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

const EditDoctorProfile = ({ route }) => {
  const { doctorInfo } = route.params;
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(doctorInfo.imageUrl);
  const [homeAddress, setHomeAddress] = useState(doctorInfo.homeAddress);
  const [email, setEmail] = useState(doctorInfo.email);
  const [str, setStr] = useState(doctorInfo.str);
  const [sip, setSip] = useState(doctorInfo.sip);
  const [phone, setPhone] = useState(doctorInfo.phoneNumber);
  const [name, setName] = useState(doctorInfo.doctorName);
  const [openImageModal, setOpenImageModal] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    if (image !== null) {
      uploadImage();
      setImage(null);
    }
  }, [image]);

  // Handler

  const uploadImage = async () => {
    const blobImage = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", image, true);
      xhr.send(null);
    });
    const metadata = {
      contentType: "image/jpeg",
    };

    const storageRef = ref(storage, "DoctorImage/" + Date.now());
    const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        switch (snapshot.state) {
          case "paused":
            break;
          case "running":
            break;
        }
      },
      (error) => {
        switch (error.code) {
          case "storage/unauthorized":
            break;
          case "storage/canceled":
            break;

          case "storage/unknown":
            break;
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setImageUrl(downloadUrl);
        });
        Alert.alert("Photo upload successful");
      }
    );
  };

  const addDoctorProfile = async () => {
    setLoading(true);
    const user = auth.currentUser;

    if (user) {
      try {
        const doctorInfo = {
          imageUrl: imageUrl ? imageUrl : imagePath.icDefaultProfile,
          doctorName: name,
          phoneNumber: phone,
          str: str,
          sip: sip,
          homeAddress: homeAddress,
          email: email,
        };
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          isProfileCreated: "true",
          doctorInfo,
        });

        setLoading(false);
        Alert.alert("Saved");
        navigation.navigate(navigationStrings.TAB_NAVIGATION);
      } catch (error) {
        console.log("Error adding doctor to Firestore:", error);
      }
    }
  };

  const takePhotoFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setOpenImageModal(false);
      setImage(result.assets[0].uri);
    }
  };

  const choosePhotoFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Library access is needed to choose a photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setOpenImageModal(false);
      setImage(result.assets[0].uri);
    }
  };

  // Renders

  function isEnableSignUp() {
    return str !== "" && sip !== "" && homeAddress !== "";
  }

  function renderWallPaper() {
    return (
      <View style={styles.box2}>
        <SafeAreaView style={styles.container5}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Image source={imagePath.icLeftArrow} style={styles.leftArrow} />
          </TouchableOpacity>
        </SafeAreaView>

        {/* <Text style={styles.doctorName}>{doctorInfo?.doctorName}</Text> */}
        <View style={styles.containerOfName}>
          <TextInput
            editable={true}
            value={name}
            onChangeText={(text) => setName(text)}
            placeholder="Write name"
            style={styles.inputName}
            placeholderTextColor={colors.gray03}
          />
        </View>
        <View style={styles.profileImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.profileimageStyle}
            />
          ) : (
            <Image
              source={imagePath.icDefaultProfile}
              style={styles.profileimageStyle}
            />
          )}
          <TouchableOpacity
            onPress={() => setOpenImageModal(true)}
            style={styles.addImageContainer}
          >
            <Image
              resizeMode="contain"
              source={imagePath.icAddImage}
              style={styles.addImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderPatientInformation() {
    return (
      <KeyboardAwareScrollView
        style={{ flex: 1, marginTop: verticalScale(90) }}
      >
        <PatientInformation
          editable={loading ? false : true}
          text={phone}
          onChangeText={(text) => setPhone(text)}
          label="Phone Number"
          icon={imagePath.icPhone}
        />
        <PatientInformation
          editable={loading ? false : true}
          text={email}
          onChangeText={(text) => setEmail(text)}
          icon={imagePath.icMail}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={loading ? false : true}
          text={str}
          onChangeText={(text) => setStr(text)}
          label="STR"
          icon={imagePath.icStr}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={loading ? false : true}
          text={sip}
          onChangeText={(text) => setSip(text)}
          label="SIP"
          icon={imagePath.icSip}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />

        <PatientInformation
          editable={loading ? false : true}
          text={homeAddress}
          onChangeText={(text) => setHomeAddress(text)}
          label="Address"
          icon={imagePath.icHome}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
      </KeyboardAwareScrollView>
    );
  }

  function renderSelectImageCategory() {
    return (
      <View>
        <Modal isVisible={openImageModal}>
          <View>
            <CustomButton
              onPress={choosePhotoFromLibrary}
              label="Upload Image"
            />
            <CustomButton
              onPress={takePhotoFromCamera}
              label="Take photo"
              containerStyle={{ marginTop: verticalScale(5) }}
            />
            <CustomButton
              onPress={() => setOpenImageModal(false)}
              label="Cancel"
              containerStyle={{
                marginTop: verticalScale(5),
                backgroundColor: colors.white,
              }}
              labelStyle={{ color: colors.secondary }}
            />
          </View>
        </Modal>
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
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {renderWallPaper()}
        {renderPatientInformation()}
        {openImageModal && renderSelectImageCategory()}
        <CustomButton
          disabled={isEnableSignUp() ? false : true}
          onPress={addDoctorProfile}
          label="Save"
          loading={loading}
          containerStyle={{
            marginTop: verticalScale(20),
            opacity: isEnableSignUp() ? 1 : 0.5,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditDoctorProfile;
