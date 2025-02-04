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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Checkbox from "expo-checkbox";
import constants from "../../../constants/constants";
import utils from "../../../utils/utils";
import styles from "./styles";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditPatientProfile = ({ navigation, route }) => {
  const { item, patientIndex } = route?.params;
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(item?.imageUrl);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [patientName, setPatientName] = useState(item?.patientName);
  const [phoneNumber, setPhoneNumber] = useState(item?.phoneNumber);
  const [placeDateOfBirth, setPlaceDateOfBirth] = useState(
    item?.placeDateOfBirth
  );
  const [homeAddress, setHomeAddress] = useState(item?.homeAddress);
  const [occupation, setOccupation] = useState(item?.occupation);
  const [sexAndMedicalHistory, setSexAndMedicalHistory] = useState(
    constants.medicalHistory
  );
  const [medicalHistory, setMedicalHistory] = useState(item.medicalHistory);
  const [sex, setSex] = useState(item?.sex);
  const [ktpPassportNumber, setKtpPassportNumber] = useState(
    item?.ktpPassportNumber
  );
  const [note, setNote] = useState(item?.note);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [showModalForGendar, setShowModalForGendar] = useState(false);
  const [showModalForMedicalHistory, setShowModalForMedicalHistory] =
    useState(false);
  const [isSelectedMale, setSelectedMale] = useState(false);
  const [isSelectedFemale, setSelectedFemale] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [datePicker, setDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateUpdated, setDateUpdated] = useState(false);

  useEffect(() => {
    if (image !== null) {
      uploadImage();
      setImage(null);
    }
  }, [image]);

  const originalDate = date.toDateString();
  const parsedDate = new Date(originalDate);
  const formattedDate = `${getFormattedDate(parsedDate)}`;

  const selectedMedicalHistory = sexAndMedicalHistory
    .filter((item) => item.selected)
    .map((item) => item.label)
    .join(", ");

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
    Alert.alert("Uploading image...");
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

  const updatePatient = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(docRef);
        if (userDocSnap.exists()) {
          const userDocData = userDocSnap.data();

          if (userDocData.patients && userDocData.patients[patientIndex]) {
            const patientData = userDocData.patients[patientIndex];
            patientData.imageUrl = imageUrl;
            patientData.patientName = patientName;
            patientData.phoneNumber = phoneNumber;
            patientData.placeDateOfBirth = dateUpdated
              ? formattedDate
              : placeDateOfBirth;
            patientData.homeAddress = homeAddress;
            patientData.occupation = occupation;
            patientData.sex = sex;
            patientData.medicalHistory = sexAndMedicalHistory.some(
              (item) => item.selected
            )
              ? selectedMedicalHistory
              : medicalHistory;
            patientData.ktpPassportNumber = ktpPassportNumber;
            patientData.note = note;
            await updateDoc(docRef, {
              patients: userDocData.patients,
            });
            setLoading(false);
            Alert.alert("Saved");
            navigation.navigate(navigationStrings.PATIENT);
          } else {
            Alert.alert("Invalid patient index or patients array not found.");
          }
        } else {
          Alert.alert("User document not found.");
        }
      } catch (error) {
        console.log(error.message);
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

  // Renders

  function isEnableSignUp() {
    return (
      patientName !== "" &&
      phoneNumber !== "" &&
      placeDateOfBirth !== "" &&
      homeAddress !== "" &&
      occupation !== "" &&
      ktpPassportNumber !== "" &&
      note !== "" &&
      phoneError === ""
    );
  }

  function onDateSelected(event, value) {
    setDate(value);
    if (Platform.OS === "android") {
      setDatePicker(false);
    }
    setDateUpdated(true);
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
          <Text style={styles.profileTextStyle}>Edit Account</Text>
        </View>
      </View>
    );
  }

  function renderProfileImage() {
    return (
      <View style={styles.profileImageContainer2}>
        <Image
          source={imageUrl ? { uri: imageUrl } : imagePath.icDefaultPatient}
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

  function renderName() {
    return (
      <View style={styles.containerOfName}>
        <TextInput
          editable={true}
          value={patientName}
          onChangeText={(text) => setPatientName(text)}
          placeholder="Write Name"
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
              <Text style={styles.selectSex}>Select Sex</Text>
              <View style={styles.CheckBoxContainer}>
                <Checkbox
                  style={styles.checkbox}
                  value={isSelectedMale}
                  onValueChange={() => {
                    setSelectedMale(true);
                    setSelectedFemale(false);
                    setSex("Male");
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
                    setSex("Female");
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
        <Modal isVisible={showModalForMedicalHistory}>
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
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={false}
          text={dateUpdated ? formattedDate : placeDateOfBirth}
          // onChangeText={text => setPlaceDsateOfBirth(formattedDate)}
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
            text={sex}
            label="Sex and Medical History"
            icon={imagePath.icHeart}
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
            text={
              sexAndMedicalHistory.some((item) => item.selected)
                ? selectedMedicalHistory
                : medicalHistory
            }
            label="Sex and Medical History"
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
          label="Ktp Passport Number"
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
                label="Treatment Plan"
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
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {Platform.OS == "android" && (
          <View
            style={{
              height: 15,
            }}
          />
        )}
        {renderHeader()}
        {renderProfileImage()}
        {renderName()}
        {renderPatientInformation()}
        {openModal && renderModal()}
        {openImageModal && renderSelectImageCategory()}
        <CustomButton
          disabled={isEnableSignUp() ? false : true}
          onPress={() => updatePatient()}
          label="Update Profile"
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

export default EditPatientProfile;
