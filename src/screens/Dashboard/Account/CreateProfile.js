import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import navigationStrings from "../../../constants/navigationStrings";
import { useNavigation } from "@react-navigation/native";

const CreateProfile = ({ route }) => {
  const { emailOfDoctor } = route.params;
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [homeAddress, setHomeAddress] = useState("");
  const [str, setStr] = useState("");
  const [sip, setSip] = useState("");
  const [openImageModal, setOpenImageModal] = useState(false);
  const [doctorData, setDoctorData] = useState([]);
  const [nameLoading, setNameLoading] = useState(false);

  const navigation = useNavigation();
  const defaultImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTCLbsiRjVurBVfEeyprpZsolqLz5eDZygwQ&usqp=CAU";

  useEffect(() => {
    const getUserData = async () => {
      setNameLoading(true);
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNameLoading(false);
        setDoctorData(data);
      } else {
        console.log("No such document!");
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    if (image !== null) {
      uploadImage();
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
          setImage(null);
        });
        Alert.alert("Photo Upload Successful");
      }
    );
  };

  const addDoctorProfile = async () => {
    setLoading(true);
    const user = auth.currentUser;

    if (user) {
      try {
        const doctorInfo = {
          imageUrl: imageUrl ? imageUrl : defaultImage,
          doctorName: doctorData?.fullName,
          phoneNumber: doctorData?.phone,
          str: str,
          sip: sip,
          homeAddress: homeAddress,
          email: emailOfDoctor,
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

  // const takePhotoFromCamera = async () => {
  //   const image = await ImagePicker.openCamera({
  //     width: 1200,
  //     height: 780,
  //     cropping: true,
  //   });
  //   setOpenImageModal(false);
  //   setImage(image.path);
  // };

  // const choosePhotoFromLibrary = () => {
  //   ImagePicker.openPicker({
  //     width: 1200,
  //     height: 780,
  //     cropping: true,
  //   }).then((image) => {
  //     setOpenImageModal(false);
  //     setImage(imagePath);
  //   });
  // };

  // Renders

  function isEnableSignUp() {
    return str !== "" && sip !== "" && homeAddress !== "";
  }

  function renderProfileImage() {
    return (
      <View style={styles.profileImageContainer2}>
        <Image
          source={imageUrl !== null ? { uri: imageUrl } : { uri: defaultImage }}
          style={styles.profileimageStyle}
        />
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
    );
  }

  function renderPatientInformation() {
    return (
      <KeyboardAwareScrollView
        style={{ flex: 1, marginTop: verticalScale(20) }}
      >
        <PatientInformation
          editable={false}
          text={doctorData.fullName}
          label="Phone Number"
          icon={imagePath.icUser}
        />
        <PatientInformation
          editable={false}
          text={doctorData.phone}
          label="Phone Number"
          icon={imagePath.icPhone}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={false}
          text={emailOfDoctor}
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
              label="Take Photo"
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
      <Text style={styles.createProfileText}>Create Profile</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {renderProfileImage()}
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

export default CreateProfile;
