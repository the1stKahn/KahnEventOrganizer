import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import imagePath from "../../../constants/imagePath";
import colors from "../../../styles/colors";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../../../styles/responsiveSize";
import {
  CustomButton,
  PatientInformation,
  TemplateOptions,
} from "../../../components";
import Modal from "react-native-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import navigationStrings from "../../../constants/navigationStrings";
import { auth, db, storage } from "../../../database/firebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Checkbox from "expo-checkbox";
import constants from "../../../constants/constants";
import utils from "../../../utils/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "./styles";

const AddNewPatient = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [placeDateOfBirth, setPlaceDateOfBirth] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [date, setDate] = useState(new Date());
  const [sexAndMedicalHistory, setSexAndMedicalHistory] = useState(
    constants.medicalHistory
  );
  const [ktpPassportNumber, setKtpPassportNumber] = useState("");
  const [note, setNote] = useState("");
  const [openImageModal, setOpenImageModal] = useState(false);
  const [showModalForGendar, setShowModalForGendar] = useState(false);
  const [showModalForMedicalHistory, setShowModalForMedicalHistory] =
    useState(false);
  const [isSelectedMale, setSelectedMale] = useState(false);
  const [isSelectedFemale, setSelectedFemale] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [datePicker, setDatePicker] = useState(false);

  const originalDate = date.toDateString();
  const parsedDate = new Date(originalDate);
  const formattedDate = ` ${getFormattedDate(parsedDate)}`;

  const selectedMedicalHistory = sexAndMedicalHistory
    .filter((item) => item.selected)
    .map((item) => item.label)
    .join(", ");

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
    const storageRef = ref(storage, "PatientsImage/" + Date.now());
    const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);
    Alert.alert("Photo Uploading...");
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
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
          setImageLoaded(true);
          setImageUrl(downloadUrl);
        });
        Alert.alert("Photo Upload Successful");
      }
    );
  };

  const addPatient = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const patientData = {
          imageUrl: imageUrl,
          patientName: patientName,
          phoneNumber: phoneNumber,
          placeDateOfBirth: formattedDate,
          homeAddress: homeAddress,
          occupation: occupation,
          sex: isSelectedFemale ? "Female" : "Male",
          medicalHistory: selectedMedicalHistory,
          ktpPassportNumber: ktpPassportNumber,
          note: note,
        };
        const patientRef = doc(db, "users", user.uid);
        await updateDoc(patientRef, {
          patients: arrayUnion(patientData),
        });

        setLoading(false);
        Alert.alert("Patient Added successfully");
      } catch (error) {
        console.log("Error adding appointment to Firestore:", error);
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

  const handleCheckboxChange = (itemId) => {
    setSexAndMedicalHistory((prevMedicalHistory) =>
      prevMedicalHistory.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  function onDateSelected(event, value) {
    setDate(value);
    if (Platform.OS === "android") {
      setDatePicker(false);
    }
  }

  function showDatePicker() {
    setDatePicker(true);
  }

  function getFormattedDate(date) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${day}-${month}-${year}`;
  }

  // Renders

  function isEnableSignUp() {
    return (
      patientName !== "" &&
      phoneNumber !== "" &&
      homeAddress !== "" &&
      occupation !== "" &&
      ktpPassportNumber !== "" &&
      note !== "" &&
      phoneError === ""
    );
  }

  function renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flex: 0.7 }}
        >
          <Image source={imagePath.icArrowLeft} style={styles.arrowStyle2} />
        </TouchableOpacity>
        <View style={{ flex: 1.5 }}>
          <Text style={styles.profileTextStyle}>Add new patient</Text>
        </View>
      </View>
    );
  }

  function renderProfileImage() {
    return (
      <View style={styles.profileImageContainer2}>
        {imageUrl !== null ? (
          <Image source={{ uri: imageUrl }} style={styles.profileimageStyle} />
        ) : (
          <Image
            source={imagePath.icDefaultPatient}
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
    );
  }

  function renderNameOfPatient() {
    return (
      <View style={styles.containerOfName}>
        <TextInput
          editable={loading ? false : true}
          value={patientName}
          onChangeText={(text) => setPatientName(text)}
          placeholder="Write name"
          style={styles.inputName}
          placeholderTextColor={colors.gray03}
        />
      </View>
    );
  }

  function renderGenderOptions() {
    return (
      <View>
        <Modal
          onBackdropPress={() => setShowModalForGendar(false)}
          isVisible={showModalForGendar}
        >
          <View style={styles.modalStyle2}>
            {/* Select Gender */}
            <View style={styles.firstContainer}>
              <Text style={styles.selectSex}>Select sex</Text>
              <View style={styles.CheckBoxContainer}>
                <Checkbox
                  style={styles.checkbox}
                  value={isSelectedMale}
                  onValueChange={() => {
                    setSelectedMale(true);
                    setSelectedFemale(false);
                  }}
                  color={isSelectedMale ? colors.secondary : undefined}
                />

                <Text style={styles.sentence}>Male</Text>
              </View>
              <View style={styles.CheckBoxContainer}>
                <Checkbox
                  style={styles.checkbox}
                  value={isSelectedFemale}
                  onValueChange={() => {
                    setSelectedMale(false);
                    setSelectedFemale(true);
                  }}
                  color={isSelectedFemale ? colors.secondary : undefined}
                />

                <Text style={styles.sentence}>Female</Text>
              </View>
            </View>

            <CustomButton
              onPress={() => setShowModalForGendar(false)}
              label="Add"
            />
          </View>
        </Modal>
      </View>
    );
  }

  function renderSelectedMedicalHistory() {
    return (
      <View>
        <Modal
          onBackdropPress={() => setShowModalForMedicalHistory(false)}
          isVisible={showModalForMedicalHistory}
        >
          <View style={styles.modalStyle2}>
            {/* Select Gender */}
            <View style={styles.firstContainer}>
              <Text
                style={[styles.selectSex, { paddingTop: verticalScale(10) }]}
              >
                Select Medical History
              </Text>

              {sexAndMedicalHistory.map((item, index) => {
                return (
                  <View
                    key={`SexAndMedicalHistory2-${index}`}
                    style={styles.CheckBoxContainer}
                  >
                    <Checkbox
                      value={item.selected}
                      onValueChange={() => handleCheckboxChange(item.id)}
                      color={item.selected ? colors.secondary : undefined}
                      style={styles.checkbox}
                    />
                    <Text style={styles.sentence}>{item.label}</Text>
                  </View>
                );
              })}
            </View>

            <CustomButton
              onPress={() => setShowModalForMedicalHistory(false)}
              label="Add"
            />
          </View>
        </Modal>
      </View>
    );
  }

  function renderPatientInformation() {
    return (
      <KeyboardAwareScrollView style={{ flex: 1 }}>
        <PatientInformation
          editable={loading ? false : true}
          keyboardType={"number-pad"}
          text={phoneNumber}
          onChangeText={(text) => {
            utils.validatePhoneNumber(text, setPhoneError);
            setPhoneNumber(text);
          }}
          phoneError={phoneError}
          label="Phone Number"
          icon={imagePath.icPhone}
        />
        <PatientInformation
          editable={false}
          text={formattedDate}
          onChangeText={(text) => setPlaceDateOfBirth(text)}
          label="Date of Birth"
          icon={imagePath.icGift}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
          sideIcon={imagePath.icCalendar}
          sideIconTrue={true}
          sideIconPress={showDatePicker}
        />
        <PatientInformation
          editable={loading ? false : true}
          text={homeAddress}
          onChangeText={(text) => setHomeAddress(text)}
          label="Home Address"
          icon={imagePath.icHome}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={loading ? false : true}
          text={occupation}
          onChangeText={(text) => setOccupation(text)}
          label="Occupation"
          icon={imagePath.icBriefCase}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        {showModalForGendar ? (
          renderGenderOptions()
        ) : (
          <PatientInformation
            editable={false}
            text={isSelectedMale ? "Male" : "Female"}
            label="Medical History"
            icon={imagePath.icGender}
            containerStyle={{
              marginTop: verticalScale(5),
            }}
            sideIconTrue={true}
            sideIconPress={() => setShowModalForGendar(true)}
            sideIcon={imagePath.icDownArrow}
          />
        )}

        {showModalForMedicalHistory ? (
          renderSelectedMedicalHistory()
        ) : (
          <PatientInformation
            editable={false}
            text={selectedMedicalHistory}
            label="Medical History"
            icon={imagePath.icHeart}
            containerStyle={{
              marginTop: verticalScale(5),
            }}
            sideIconTrue={true}
            sideIcon={imagePath.icDownArrow}
            sideIconPress={() => setShowModalForMedicalHistory(true)}
          />
        )}

        <PatientInformation
          editable={loading ? false : true}
          text={ktpPassportNumber}
          onChangeText={(text) => setKtpPassportNumber(text)}
          label="KTP/Passport Number"
          icon={imagePath.icCredit}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={loading ? false : true}
          text={note}
          onChangeText={(text) => setNote(text)}
          label="Note"
          icon={imagePath.icEdit}
          containerStyle={{
            marginTop: verticalScale(5),
            borderBottomWidth: 0,
          }}
        />
      </KeyboardAwareScrollView>
    );
  }

  function renderModal() {
    return (
      <View>
        <Modal isVisible={openModal}>
          <View style={[styles.modalStyle, { height: moderateScale(270) }]}>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              {/* Examination Template */}
              <TemplateOptions
                onPress={() => {
                  navigation.navigate(navigationStrings.EXAMINATION),
                    setOpenModal(false);
                }}
                icon={imagePath.icDentalMachine}
                label="Examination"
              />

              {/* Prescriptions Template */}
              <TemplateOptions
                onPress={() => {
                  navigation.navigate(navigationStrings.PRESCRIPTION),
                    setOpenModal(false);
                }}
                icon={imagePath.icReceipt}
                label="Perscription"
                containerStyle={{ marginLeft: scale(50) }}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <TemplateOptions
                onPress={() => {
                  navigation.navigate(navigationStrings.TREATMENT_PLAN),
                    setOpenModal(false);
                }}
                icon={imagePath.icWhatIDo}
                label="Template Plan"
                containerStyle={{ marginTop: verticalScale(30) }}
              />
              <TemplateOptions
                icon={imagePath.icAppointment}
                label="Appointment"
                containerStyle={{
                  marginTop: verticalScale(30),
                  marginLeft: scale(50),
                }}
              />
            </View>
          </View>
        </Modal>
      </View>
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          styles.container,
          {
            marginBottom: verticalScale(20),
          },
        ]}
      >
        {Platform.OS == "android" && (
          <View
            style={{
              height: 15,
            }}
          />
        )}
        {renderHeader()}
        {renderProfileImage()}
        {renderNameOfPatient()}
        {renderPatientInformation()}
        {openModal && renderModal()}
        {openImageModal && renderSelectImageCategory()}
        <CustomButton
          disabled={isEnableSignUp() ? false : true}
          onPress={addPatient}
          label="Save"
          loading={loading}
          containerStyle={{
            marginTop: verticalScale(20),
            opacity: isEnableSignUp() ? 1 : 0.5,
          }}
        />
      </ScrollView>
      {datePicker && (
        <>
          <DateTimePicker
            value={date}
            mode={"date"}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            is24Hour={true}
            onChange={onDateSelected}
            style={styles.datePicker}
            textColor={colors.black}
            // minimumDate={new Date()}
          />
          <CustomButton
            onPress={() => setDatePicker(false)}
            containerStyle={styles.cancelButton}
            label="Cancel"
            labelStyle={styles.cancelButtonLabel}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default AddNewPatient;
