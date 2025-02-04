import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Dimensions,
  TextInput,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import imagePath from "../../../constants/imagePath";

import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from "../../../styles/responsiveSize";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CustomButton, CustomTextInput } from "../../../components";
import Modal from "react-native-modal";
import CheckBox from "expo-checkbox";
import { auth, db, storage } from "../../../database/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { objective } from "../../../constants/objective";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import SearchableDropdown from "react-native-searchable-dropdown";
import { toothPosition } from "../../../constants/toothPosition";

const Examination = ({ navigation, route }) => {
  const { patientIndex, item, key } = route.params;
  const [openModal, setOpenModal] = useState(false);
  const [openModalAssessmentResult, setOpenModalAssessmentResult] =
    useState(false);
  const [date, setDate] = useState(new Date());
  const [openTemplate, setOpenTemplate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [loadingExamination, setLoadingExamination] = useState(false);
  const [editable, setEditable] = useState(false);
  const [medicalTreatmentList, setMedicalTreatmentList] = useState([]);
  const [medicalTreatmentList2, setMedicalTreatmentList2] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [examinationTemplateList, setExaminationTemplateList] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [examinationDate, setExaminationDate] = useState("");
  const [patientIssueSubjective, setPatientIssueSubjective] = useState("");
  const [patientIssueObjective, setPatientIssueObjective] = useState("");
  const [assessmentResult, setAssessmentResult] = useState([]);
  const [nextSteps, setNextSteps] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [otherNote, setOtherNote] = useState("");
  const [sex, setSex] = useState("");
  const [address, setAddress] = useState("");
  const [imageView, setImageView] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [datePicker, setDatePicker] = useState(false);
  const [imagesFromGallery, setImagesFromGallery] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [dataOfPatients, setDataOfPatients] = useState([]);
  const [patientNames, setPatientNames] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filteredPatientNames, setFilteredPatientNames] = useState([]);
  const [indexOfPatient, setIndexOfPatient] = useState(0);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filterTextAssessment, setFilterTextAssessment] = useState("");
  const [diagnose, setDiagnose] = useState(objective);
  const [selectPosition, setSelectPosition] = useState("");
  const [selectedAssessmentItems, setSelectedAssessmentItems] = useState([]);
  const [isVisibleSearchAssessmentItem, setIsVisibleSearchAssessmentItem] =
    useState(false);

  const MAX_PHOTOS = 4;

  useEffect(() => {
    getTemplates();
    getMedicalTreatment();
    getPatientData();
  }, []);

  useEffect(() => {
    setPatientName(item.patientName || "");
    setPatientDob(item.placeDateOfBirth || item.patientDob || "");
    setExaminationDate(item.examinationDate || "");
    setPatientIssueSubjective(item.patientIssueSubjective || "");
    setPatientIssueObjective(item.patientIssueObjective || "");
    setAssessmentResult(item.assessmentResult || []);
    setNextSteps(item.nextSteps || "");
    setPaymentMethod(item.paymentMethod || "");
    setRecommendation(item.recommendation || "");
    setOtherNote(item.otherNote || "");
    setDoctorNote(item.doctorNote || "");
    setMedicalTreatmentList2(item.medicalTreatment || []);
    setImageUrls(item.examinationImages || []);
    setSex(item.sex || "");
    setAddress(item.address || item.homeAddress || "");
    console.log(medicalTreatmentList);
  }, []);

  useEffect(() => {
    if (imagesFromGallery.length > 0) {
      uploadImages();
    }
  }, [imagesFromGallery]);

  const originalDate = date.toDateString();
  const parsedDate = new Date(originalDate);
  const formattedDate = `${getFormattedDate(parsedDate)}`;

  // Function to upload images
  const uploadImages = async () => {
    if (imagesFromGallery.length === 0) {
      return;
    }
    if (imagesFromGallery.length > 4) {
      Alert.alert("You can only upload a maximum of 4 images.");
      return;
    }
    try {
      setUploading(true);
      const uploadPromises = imagesFromGallery.map(async (image) => {
        const blobImage = await fetch(image).then((response) =>
          response.blob()
        );
        const metadata = {
          contentType: "image/jpeg",
        };

        const storageRef = ref(storage, "examination/" + Date.now());
        const uploadTask = uploadBytesResumable(
          storageRef,
          blobImage,
          metadata
        );

        return new Promise(async (resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            (error) => {
              reject(error);
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            }
          );
        });
      });
      const uploadResults = await Promise.all(uploadPromises);
      setImageUrls((prevUrls) => [...prevUrls, ...uploadResults]);
      setImagesFromGallery([]);
      setUploading(false);
      Alert.alert("Images uploaded successfully");
    } catch (error) {
      setUploading(false);
    }
  };

  // Gettting Data from Firebase

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

  const getTemplates = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setExaminationTemplateList(data.examinationTemplate);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getMedicalTreatment = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMedicalTreatmentList(data.medicalTreatmentInfo);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Adding Data to Firebase

  const addExamination = async () => {
    setLoadingExamination(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString("default", {
          month: "long",
        });
        const currentYear = currentDate.getFullYear();
        const docRef = doc(db, "users", user.uid);
        const selectedMedicalTreatments = selectedItems.map(
          (index) => medicalTreatmentList[index]
        );
        const userDocSnap = await getDoc(docRef);
        if (userDocSnap.exists()) {
          const userDocData = userDocSnap.data();

          if (
            userDocData.patients &&
            userDocData.patients[
              key === "create" ? indexOfPatient : patientIndex
            ]
          ) {
            const patientData =
              userDocData.patients[
                key === "create" ? indexOfPatient : patientIndex
              ];
            const examinationArray = patientData.examination || [];

            // Add the new examination details to the examination array
            examinationArray.push({
              _id:
                Date.now().toString() + Math.random().toString(36).substring(7),
              patientName,
              sex,
              address,
              patientDob,
              examinationDate: formattedDate,
              patientIssueSubjective,
              patientIssueObjective,
              assessmentResult,
              nextSteps,
              recommendation,
              paymentMethod,
              otherNote,
              doctorNote,
              medicalTreatment:
                medicalTreatmentList2?.length > 0
                  ? medicalTreatmentList2
                  : selectedMedicalTreatments,
              examinationImages: imageUrls,
              month: currentMonth,
              year: currentYear,
            });
            userDocData.patients[
              key === "create" ? indexOfPatient : patientIndex
            ].examination = examinationArray;
            await updateDoc(docRef, userDocData);

            Alert.alert("Examination added successfully");
            resetFields();
            setLoadingExamination(false);
            setOpenModal(false);
            navigation.goBack();
          } else {
            console.log("Invalid patient index or patients array not found.");
          }
        } else {
          Alert.alert("User document not found.");
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  // Updating Data to Firebase
  const updateExamination = async () => {
    setLoadingExamination(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString("default", {
          month: "long",
        });
        const currentYear = currentDate.getFullYear();
        const docRef = doc(db, "users", user.uid);
        const selectedMedicalTreatments = selectedItems.map(
          (index) => medicalTreatmentList[index]
        );
        const userDocSnap = await getDoc(docRef);
        if (userDocSnap.exists()) {
          const userDocData = userDocSnap.data();

          if (userDocData.patients && userDocData.patients[patientIndex]) {
            const patientData = userDocData.patients[patientIndex];
            const examinationArray = patientData.examination || [];
            const indexExam = examinationArray.findIndex(
              (exam) => exam._id === item._id
            );
            // Update the examination details in the examination array
            examinationArray.splice(indexExam, 1, {
              _id: item._id,
              patientName,
              sex,
              address,
              patientDob,
              examinationDate: formattedDate,
              patientIssueSubjective,
              patientIssueObjective,
              assessmentResult,
              nextSteps,
              recommendation,
              paymentMethod,
              otherNote,
              doctorNote,
              medicalTreatment: medicalTreatmentList2,
              examinationImages: imageUrls,
              month: currentMonth,
              year: currentYear,
            });
            userDocData.patients[
              key === "create" ? indexOfPatient : patientIndex
            ].examination = examinationArray;
            await updateDoc(docRef, userDocData);

            Alert.alert("Examination updated successfully");
            resetFields();
            setLoadingExamination(false);
            setOpenModal(false);
            navigation.goBack();
          } else {
            Alert.alert("Invalid patient index or patients array not found.");
            setLoadingExamination(false);
          }
        } else {
          Alert.alert("User document not found.");
          setLoadingExamination(false);
        }
      } catch (error) {
        console.log(error.message);
        setLoadingExamination(false);
      }
    }
  };

  const updateExaminationAssessmentResults = async () => {
    setLoadingExamination(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString("default", {
          month: "long",
        });
        const currentYear = currentDate.getFullYear();
        const docRef = doc(db, "users", user.uid);

        const userDocSnap = await getDoc(docRef);
        if (userDocSnap.exists()) {
          const userDocData = userDocSnap.data();

          if (userDocData.patients && userDocData.patients[patientIndex]) {
            const patientData = userDocData.patients[patientIndex];
            const examinationArray = patientData.examination || [];
            const indexExam = examinationArray.findIndex(
              (exam) => exam._id === item._id
            );
            // Update the examination details in the examination array
            examinationArray.splice(indexExam, 1, {
              _id: item._id,
              patientName,
              sex,
              address,
              patientDob,
              examinationDate: formattedDate,
              patientIssueSubjective,
              patientIssueObjective,
              assessmentResult,
              nextSteps,
              recommendation,
              paymentMethod,
              otherNote,
              doctorNote,
              medicalTreatment: medicalTreatmentList2,
              examinationImages: imageUrls,
              month: currentMonth,
              year: currentYear,
            });
            userDocData.patients[
              key === "create" ? indexOfPatient : patientIndex
            ].examination = examinationArray;
            await updateDoc(docRef, userDocData);
            Alert.alert("Examination updated successfully");
            setOpenModal(false);
            setSelectPosition("");
            setSelectedAssessmentItems([]);
            setLoadingExamination(false);
          } else {
            Alert.alert("Invalid patient index or patients array not found.");
            setSelectPosition("");
            setSelectedAssessmentItems([]);
            setLoadingExamination(false);
          }
        } else {
          Alert.alert("User document not found.");
          setSelectPosition("");
          setSelectedAssessmentItems([]);
          setLoadingExamination(false);
        }
      } catch (error) {
        console.log(error.message);
        setSelectPosition("");
        setSelectedAssessmentItems([]);
        setLoadingExamination(false);
      }
    }
  };

  // Deleting Data from Firebase
  const handleDeleletExam = async (index) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("User not authenticated.");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(docRef);
      const userDocData = userDocSnap.data();
      const patients = userDocData.patients || [];
      const patientData = patients[patientIndex];
      const examinationArray = patientData.examination || [];

      // Find the index of the treatment item with a matching _id
      const indexExam = examinationArray.findIndex(
        (exam) => exam._id === item._id
      );
      if (indexExam === -1) {
        Alert.alert("Examination item not found.");
        return;
      }

      const examinationItem = examinationArray[indexExam];
      const medicalTreatmentArray = examinationItem.medicalTreatment || [];
      medicalTreatmentArray.splice(index, 1);

      // Update the user document
      examinationItem.medicalTreatment = medicalTreatmentArray;
      examinationArray[indexExam] = examinationItem;
      patientData.examination = examinationArray;
      patients[patientIndex] = patientData;
      userDocData.patients = patients;
      await updateDoc(docRef, userDocData);

      setMedicalTreatmentList2(medicalTreatmentArray);
      updateExaminationAssessmentResults();
      Alert.alert("Medical Treatment deleted successfully");
      setOpenModal(false);
    } catch (error) {
      Alert.alert(
        "An error occurred while deleting medical treatment: " + error.message
      );
    }
  };

  // Handlers

  const deleteAlertExam = (ind) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this medical treatment?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDeleletExam(ind),
          style: "destructive",
        },
      ]
    );
  };

  const deleteAlertAssessmentResult = (ind) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this assessment result?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDeleteAssessmentResult(ind),
          style: "destructive",
        },
      ]
    );
  };

  // Deleting Data from Firebase
  const handleDeleteAssessmentResult = async (index) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("User not authenticated.");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(docRef);
      const userDocData = userDocSnap.data();
      const patients = userDocData.patients || [];
      const patientData = patients[patientIndex];
      const examinationArray = patientData.examination || [];

      // Find the index of the treatment item with a matching _id
      const indexExam = examinationArray.findIndex(
        (exam) => exam._id === item._id
      );
      if (indexExam === -1) {
        Alert.alert("Examination item not found.");
        return;
      }

      const examinationItem = examinationArray[indexExam];
      const assessmentResultArray = examinationItem.assessmentResult || [];
      assessmentResultArray.splice(index, 1);

      examinationItem.assessmentResult = assessmentResultArray;
      examinationArray[indexExam] = examinationItem;
      patientData.examination = examinationArray;
      patients[patientIndex] = patientData;
      userDocData.patients = patients;
      await updateDoc(docRef, userDocData);

      setAssessmentResult(assessmentResultArray);
      Alert.alert("Assessment Result deleted successfully");
      setOpenModal(false);
    } catch (error) {
      Alert.alert(
        "An error occurred while deleting assessment result: " + error.message
      );
    }
  };

  const handleDeleteAddAssessmentResult = async (index) => {
    const newAssessmentResult = [...assessmentResult];
    newAssessmentResult.splice(index, 1);
    setAssessmentResult(newAssessmentResult);
  };

  const handleOnPress = (item) => {
    setPatientIssueSubjective(item.patientIssueSubjective);
    setPatientIssueObjective(item.patientIssueObjective);
    setAssessmentResult(item.assessmentResult);
    setNextSteps(item.nextSteps);
    setRecommendation(item.recommendation);
    setOtherNote(item.otherNotes);
    setDoctorNote(item.doctorPersonalNote);
    setMedicalTreatmentList2(item.medicalTreatment);
    setOpenTemplate(false);
  };

  const handleDeleteMedicalTreatment = (index) => {
    const newMedicalTreatmentList = [...medicalTreatmentList2];
    const newSelectedItems = [...selectedItems];
    newMedicalTreatmentList.splice(index, 1);
    newSelectedItems.splice(index, 1);
    setMedicalTreatmentList2(newMedicalTreatmentList);
    setSelectedItems(newSelectedItems);
  };

  const selectedMedicalItems = (item, index) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginRight: scale(20),
        }}
      >
        <Text
          style={[
            styles.sentence,
            { paddingTop: index === 0 ? verticalScale(5) : verticalScale(10) },
          ]}
        >
          {item.medicalTreatment} - Rp {item.pricePerUnit}
        </Text>
        {key === "preview" ? null : (
          <TouchableOpacity
            onPress={
              key === "editExamination"
                ? () => deleteAlertExam(index)
                : () => handleDeleteMedicalTreatment(index)
            }
          >
            <Image source={imagePath.icDelete} style={styles.deleteContainer} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const calculateTotalPrice = () => {
    const totalPrice = selectedItems.reduce((acc, index) => {
      const item = medicalTreatmentList[index];
      const pricePerUnit = parseInt(item.pricePerUnit, 10);
      return acc + pricePerUnit;
    }, 0);

    return totalPrice;
  };

  const calculateTotalPriceEdit = () => {
    const totalPrice = medicalTreatmentList2.reduce((acc, item) => {
      const pricePerUnit = parseInt(item.pricePerUnit, 10) || 0;
      return acc + pricePerUnit;
    }, 0);

    return totalPrice;
  };

  const choosePhotoFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please enable Photo Library permissions",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: false,
        quality: 1,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;

        if (imageUrls.length < MAX_PHOTOS) {
          setOpenImageModal(false);
          setImageUrls((prevPhotos) => [...prevPhotos, selectedImage]);
        } else {
          Alert.alert(
            "Oops...",
            `You can only upload up to ${MAX_PHOTOS} photos`,
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.log("Error selecting photo:", error);
    }
  };

  const takePhotoFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please enable Camera permissions", [
          { text: "OK" },
        ]);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 1,
        aspect: [4, 3], // Aspect ratio to crop (e.g., 4:3 for standard photos)
      });

      if (!result.canceled) {
        const capturedImage = result.assets[0].uri;

        if (imageUrls.length < MAX_PHOTOS) {
          setOpenImageModal(false);
          setImageUrls((prevPhotos) => [...prevPhotos, capturedImage]);
        } else {
          Alert.alert(
            "Oops...",
            `You can only upload up to ${MAX_PHOTOS} photos`,
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.log("Error capturing photo:", error);
    }
  };

  const deleteImage = (index) => {
    const newImages = [...imageUrls];
    newImages.splice(index, 1);
    setImageUrls(newImages);
  };

  const handleFindPatientNameChange = (text) => {
    setPatientName(text);
    if (!Array.isArray(dataOfPatients)) {
      console.error("dataOfPatients is not an array or is undefined");
      return;
    }
    const filteredTerms = dataOfPatients.filter((term) =>
      term.patientName.toLowerCase().startsWith(text.toLowerCase())
    );
    if (text === "") {
      setPatientNames(false);
    } else {
      setPatientNames(true);
      setFilteredPatientNames(filteredTerms);
    }
  };

  // Render

  function onDateSelected(event, value) {
    setDate(value);
    if (Platform.OS === "android") {
      setDatePicker(false);
    }
  }

  function getFormattedDate(date) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${day}-${month}-${year}`;
  }

  function renderSelectImageCategory() {
    return (
      <View>
        <Modal
          onBackdropPress={() => setOpenImageModal(false)}
          isVisible={openImageModal}
        >
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

  function renderInputFields() {
    return (
      <GestureHandlerRootView style={styles.container}>
        {Platform.OS == "android" && (
          <View
            style={{
              height: 15,
            }}
          />
        )}
        <KeyboardAwareScrollView
          contentContainerStyle={{ marginHorizontal: scale(16) }}
          style={styles.container}
        >
          {key === "preview" ? (
            <View />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOpenTemplate(true)}
            >
              <Text style={styles.useTemplate}>Use Template</Text>
            </TouchableOpacity>
          )}
          {/* 1 */}
          <Text style={styles.title}>Patient Name</Text>
          <CustomTextInput
            editable={key === "create" ? true : editable}
            value={patientName}
            onChangeValue={handleFindPatientNameChange}
            containerStyle={styles.textInputColor}
            inputStyle={{
              color:
                key === "create" || editable ? colors.black : colors.gray03,
            }}
          />

          {patientNames ? (
            <ScrollView style={styles.patientNameItemContainer}>
              {filteredPatientNames.length === 0 ? (
                <>{setPatientNames(false)}</>
              ) : (
                filteredPatientNames.map((patient, index) => (
                  <TouchableOpacity
                    onPress={() => {
                      const selectedPatientName = patient.patientName;
                      const selectedPatient = dataOfPatients.find(
                        (patient) => patient.patientName === selectedPatientName
                      );
                      if (selectedPatient) {
                        // setPatientDetails(selectedPatient);
                        setPatientName(selectedPatient.patientName);
                        setPatientDob(selectedPatient.placeDateOfBirth);
                        setSex(selectedPatient.sex);
                        setAddress(selectedPatient.homeAddress);
                        setPatientNames(false);
                        const indexOfSelectedPatient =
                          dataOfPatients.indexOf(selectedPatient);
                        setIndexOfPatient(indexOfSelectedPatient);
                      } else {
                        console.error(
                          "Selected patient not found in dataOfPatients"
                        );
                      }
                    }}
                    style={styles.objectiveItemContainer}
                    key={index}
                  >
                    <Text style={styles.objectiveItemTitle}>
                      {patient.patientName}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          ) : null}

          {/* 2 */}
          <Text style={styles.title}>Date Of Birth</Text>
          <CustomTextInput
            editable={false}
            value={patientDob}
            onChangeValue={(text) => setPatientDob(text)}
            containerStyle={styles.textInputColor}
            inputStyle={{
              color: colors.gray03,
            }}
          />

          <Text style={styles.title}>Sex</Text>
          <CustomTextInput
            editable={key === "fromPatientProfil" ? true : editable}
            value={sex}
            onChangeValue={(text) => setSex(text)}
            containerStyle={styles.textInputColor}
            inputStyle={{ color: editable ? colors.black : colors.gray03 }}
          />

          <Text style={styles.title}>Address</Text>
          <CustomTextInput
            editable={key === "fromPatientProfil" ? true : editable}
            value={address}
            onChangeValue={(text) => setAddress(text)}
            containerStyle={styles.textInputColor}
            inputStyle={{ color: editable ? colors.black : colors.gray03 }}
          />

          {/*3 */}
          <Text style={styles.title}>Examination Date</Text>
          <CustomTextInput
            // editable={key === 'preview' ? false : true}
            editable={key === "fromPatientProfil" ? true : editable}
            value={key === "preview" ? examinationDate : formattedDate}
            onChangeValue={(text) => setExaminationDate(text)}
            containerStyle={styles.textInputColor}
            inputStyle={{ color: editable ? colors.black : colors.gray03 }}
            // showIcon={key === 'preview' ? false : true}
            // icon={imagePath.icCalendar}
            // showPassword={showDatePicker}
            // iconStylesInTextInput={{
            //   width: moderateScale(20),
            //   height: moderateScale(20),
            // }}
          />

          {/*4 */}
          <Text style={styles.title}>Patient Issue (Subjective)</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={patientIssueSubjective}
            onChangeValue={(text) => setPatientIssueSubjective(text)}
            containerStyle={styles.textInputColor}
          />

          {/* 5 */}
          <Text style={styles.title}>Patient Issue (Objective)</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={patientIssueObjective}
            onChangeValue={(text) => setPatientIssueObjective(text)}
            containerStyle={styles.textInputColor}
          />

          {/* 6 */}
          <View style={styles.medicalTreatmentCont}>
            <Text style={styles.title}>Assessment Result</Text>
            {key === "preview" ? (
              <View />
            ) : (
              <TouchableOpacity
                style={styles.boxTouch}
                onPress={() => setOpenModalAssessmentResult(true)}
              >
                <Image source={imagePath.icPlus} style={styles.plusStyle} />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles.flatListContainerStyle,
              styles.position,
              {
                marginTop: 16,
                marginRight: 22,
                backgroundColor: colors.gray01,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: colors.gray02,
              },
            ]}
          >
            {assessmentResult.length == 0 ? (
              <View
                style={{
                  backgroundColor: colors.gray01,
                  height: scale(40),
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: colors.gray02,
                }}
              />
            ) : (
              assessmentResult.map((value, indexPosition) => {
                return (
                  <View key={indexPosition}>
                    <View
                      style={{
                        flexDirection: "row",
                        height: scale(30),
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginRight: scale(16),
                      }}
                    >
                      <Text style={[styles.title, { fontSize: textScale(14) }]}>
                        {value.position}
                      </Text>
                      {key === "preview" ? null : (
                        <TouchableOpacity
                          onPress={
                            key === "editExamination"
                              ? () => deleteAlertAssessmentResult(indexPosition)
                              : () =>
                                  handleDeleteAddAssessmentResult(indexPosition)
                          }
                        >
                          <Image
                            source={imagePath.icDelete}
                            style={styles.deleteContainer}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    {value.results.map((result, indexItem) => {
                      return (
                        <View
                          style={{
                            margin: scale(16),
                            marginTop: scale(0),
                            marginBottom: scale(5),
                            flexDirection: "row",
                            justifyContent: "space-between",
                            height: scale(20),
                          }}
                        >
                          <View style={{ height: scale(20), width: "90%" }}>
                            <Text
                              style={{ fontSize: 14, color: "#000" }}
                              key={indexItem}
                            >
                              {indexItem + 1 + " ." + result}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })
            )}
          </View>

          {/* 7 */}
          <Text style={[styles.title, { marginTop: verticalScale(25) }]}>
            Next Steps
          </Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={nextSteps}
            onChangeValue={(text) => setNextSteps(text)}
            containerStyle={styles.textInputColor}
          />

          {/* 8 */}
          <View style={styles.medicalTreatmentCont}>
            <Text style={styles.title}>Medical Treatment</Text>
            {key === "preview" ? (
              <View />
            ) : (
              <TouchableOpacity onPress={() => setOpenModal(true)}>
                <Image source={imagePath.icPlus} style={styles.plusStyle} />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.container3, { marginTop: 16 }]}>
            <FlatList
              scrollEnabled={false}
              contentContainerStyle={styles.flatListContainerStyle}
              data={medicalTreatmentList2}
              renderItem={({ item, index }) =>
                selectedMedicalItems(item, index)
              }
              keyExtractor={(item, index) => index.toString()}
            />

            <Text style={styles.totalText}>
              Total: Rp{" "}
              {medicalTreatmentList2 && selectedItems.length === 0
                ? calculateTotalPriceEdit()
                : calculateTotalPrice()}
            </Text>
          </View>

          <Text style={[styles.title, { marginTop: verticalScale(25) }]}>
            Payment Method
          </Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            value={paymentMethod}
            onChangeValue={(text) => setPaymentMethod(text)}
            containerStyle={styles.textInputColor}
          />

          {/* 10*/}
          <Text style={styles.title}>Recommendations & Restrictions</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={recommendation}
            onChangeValue={(text) => setRecommendation(text)}
            containerStyle={styles.textInputColor}
          />
          {/* 11 */}
          <Text style={styles.title}>Other Note</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={otherNote}
            onChangeValue={(text) => setOtherNote(text)}
            containerStyle={styles.textInputColor}
          />
          {/* 12 */}
          <Text style={styles.title}>Doctor's Personal Note (Not Shared)</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={doctorNote}
            onChangeValue={(text) => setDoctorNote(text)}
            containerStyle={styles.textInputColor}
          />
          {/* Upload photos upto 4 */}
          <Text style={styles.title}>Please upload up to 4 photos</Text>
          <View style={styles.fourPhotoContainer}>
            {imageUrls.length === 4 ? (
              <View />
            ) : key === "preview" ? (
              <View />
            ) : (
              <TouchableOpacity
                onPress={() => setOpenImageModal(true)}
                activeOpacity={0.7}
                style={styles.cameraContainer}
              >
                <Image
                  source={imagePath.icAddImage}
                  style={{
                    width: moderateScale(30),
                    height: moderateScale(30),
                  }}
                />
              </TouchableOpacity>
            )}
            {imageUrls.length > 0 ? (
              imageUrls.map((item, index) => {
                return (
                  <View style={{}}>
                    <TouchableOpacity
                      activeOpacity={key === "preview" ? 0.5 : 1}
                      onPress={
                        key === "preview"
                          ? () => {
                              setIsImageModalVisible(true), setImageView(item);
                            }
                          : () => {}
                      }
                      style={styles.cameraContainer2}
                    >
                      <Image source={{ uri: item }} style={styles.itemImages} />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => deleteImage(index)}
                        style={styles.layoutContainerDelete}
                      >
                        {key === "preview" ? (
                          <View />
                        ) : (
                          <Image
                            source={imagePath.icRemove}
                            style={styles.deleteContainerImage}
                          />
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View />
            )}
          </View>
        </KeyboardAwareScrollView>
      </GestureHandlerRootView>
    );
  }

  function renderModal() {
    return (
      <View>
        <Modal
          onBackdropPress={() => setOpenModal(false)}
          isVisible={openModal}
        >
          <View style={styles.modalStyle3}>
            {medicalTreatmentList === undefined ? (
              <View style={styles.noDataContainer}>
                <Image
                  source={imagePath.icNoData}
                  style={styles.noDataImage2}
                />
                <Text style={styles.noSetupText}>
                  No setup found. Please create one first
                </Text>
              </View>
            ) : (
              <>
                <TextInput
                  placeholder="Search medical treatments"
                  value={filterText}
                  onChangeText={(text) => setFilterText(text)}
                  style={[styles.searchInput, { color: colors.black }]}
                />
                <FlatList
                  contentContainerStyle={styles.flatListContainer}
                  data={medicalTreatmentList.filter((item) =>
                    item.medicalTreatment
                      .toLowerCase()
                      .includes(filterText.toLowerCase())
                  )}
                  renderItem={({ item, index }) => (
                    <View key={index} style={styles.CheckBoxContainer}>
                      <CheckBox
                        value={selectedItems.includes(index)}
                        onValueChange={() => {
                          if (selectedItems.includes(index)) {
                            setSelectedItems(
                              selectedItems.filter((i) => i !== index)
                            );
                          } else {
                            setSelectedItems([...selectedItems, index]);
                          }
                        }}
                        color={
                          selectedItems.includes(index)
                            ? colors.secondary
                            : undefined
                        }
                        style={styles.checkbox}
                      />
                      <Text style={styles.sentence}>
                        {item.medicalTreatment} - Rp {item.pricePerUnit}
                      </Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                />
                <CustomButton
                  onPress={() => {
                    if (key == "editExamination") {
                      const newSelect = selectedItems.map(
                        (v, i) => medicalTreatmentList[i]
                      );
                      const oldSelect = medicalTreatmentList2;
                      const joinSelect = [...oldSelect, ...newSelect];
                      setMedicalTreatmentList2(joinSelect);
                      setSelectedItems([]);
                      setOpenModal(false);
                      setTimeout(async () => {
                        await updateExaminationAssessmentResults();
                      }, 1000);
                    } else {
                      const newSelect = selectedItems.map(
                        (v, i) => medicalTreatmentList[i]
                      );
                      const oldSelect = medicalTreatmentList2;
                      const joinSelect = [...oldSelect, ...newSelect];
                      setMedicalTreatmentList2(joinSelect);
                      setSelectedItems([]);
                      setOpenModal(false);
                    }
                  }}
                  label="Add"
                />
              </>
            )}
          </View>
        </Modal>
      </View>
    );
  }

  function renderModalAssessmentResult() {
    return (
      <View>
        <Modal
          onBackdropPress={() => {
            setSelectPosition("");
            setSelectedAssessmentItems([]);
            setOpenModalAssessmentResult(false);
          }}
          isVisible={openModalAssessmentResult}
        >
          <View style={[styles.modalStyle3, { height: moderateScale(500) }]}>
            {assessmentResult === undefined ? (
              <View style={styles.noDataContainer}>
                <Image
                  source={imagePath.icNoData}
                  style={styles.noDataImage2}
                />
              </View>
            ) : (
              <>
                <View
                  style={{ height: 50, width: "100%", flexDirection: "row" }}
                >
                  <View style={{ height: 50, width: "100%" }}>
                    <SearchableDropdown
                      onTextChange={(text) => console.log(text)}
                      onItemSelect={(item) => setSelectPosition(item.name)}
                      containerStyle={{ padding: 5 }}
                      itemStyle={{
                        padding: 10,
                        marginTop: 2,
                        backgroundColor: "rgba(255,255,255,0.8)",
                        borderWidth: 1,
                      }}
                      itemTextStyle={{ color: colors.black }}
                      itemsContainerStyle={{ maxHeight: 300 }}
                      items={toothPosition}
                      placeholder="Cari Posisi Gigi..."
                      placeholderTextColor={colors.black}
                      resetValue={false}
                      onFocus={() => setIsVisibleSearchAssessmentItem(true)}
                      onBlur={() => setIsVisibleSearchAssessmentItem(false)}
                    />
                  </View>
                  <View
                    style={{
                      height: 40,
                      width: "30%",
                      position: "absolute",
                      right: 0,
                      alignSelf: "flex-end",
                    }}
                  >
                    <Text
                      style={[
                        styles.Title,
                        { fontSize: 16, color: "#000", fontWeight: "bold" },
                      ]}
                    >
                      {selectPosition}
                    </Text>
                  </View>
                </View>
                {isVisibleSearchAssessmentItem == true ? null : (
                  <TextInput
                    placeholder="Search assessment results"
                    value={filterTextAssessment}
                    placeholderTextColor={colors.black}
                    onChangeText={(text) => {
                      setFilterTextAssessment(text);
                      if (text.length == 0) {
                        setDiagnose(objective);
                      } else {
                        const filtered = diagnose.filter((item) => {
                          var textResult = `${item.label} ${item.description}`;
                          return textResult
                            .toLowerCase()
                            .includes(text.toLowerCase());
                        });
                        setDiagnose(filtered);
                      }
                    }}
                    style={[styles.searchInput, { color: colors.black }]}
                  />
                )}
                {isVisibleSearchAssessmentItem == true ? null : (
                  <FlatList
                    contentContainerStyle={[styles.flatListContainer]}
                    data={diagnose}
                    renderItem={({ item, index }) => (
                      <View key={index} style={styles.CheckBoxContainer}>
                        <CheckBox
                          value={selectedAssessmentItems.includes(
                            `${item.label} ${item.description}`
                          )}
                          onValueChange={() => {
                            if (
                              selectedAssessmentItems.includes(
                                `${item.label} ${item.description}`
                              )
                            ) {
                              setSelectedAssessmentItems(
                                selectedAssessmentItems.filter(
                                  (v, i) =>
                                    v !== `${item.label} ${item.description}`
                                )
                              );
                            } else {
                              let result = `${diagnose[index].label} ${diagnose[index].description}`;
                              setSelectedAssessmentItems([
                                ...selectedAssessmentItems,
                                result,
                              ]);
                            }
                          }}
                          color={
                            selectedAssessmentItems.includes(index)
                              ? colors.secondary
                              : undefined
                          }
                          style={styles.checkbox}
                        />
                        <Text style={styles.sentence}>
                          {item.label} {item.description}
                        </Text>
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                  />
                )}
                {isVisibleSearchAssessmentItem == true ? null : (
                  <CustomButton
                    onPress={() => {
                      if (key == "editExamination") {
                        console.log(selectPosition);
                        if (selectPosition == "") {
                          Alert.alert(
                            "Warning",
                            "Tooth position or assessment results are required"
                          );
                        } else {
                          const newAssessmentResult = {
                            position: selectPosition,
                            results: selectedAssessmentItems,
                          };
                          const updateAssessmentResults = [
                            ...assessmentResult,
                            newAssessmentResult,
                          ];
                          setAssessmentResult(updateAssessmentResults);
                          setOpenModalAssessmentResult(false);
                          setTimeout(async () => {
                            await updateExaminationAssessmentResults();
                          }, 1000);
                        }
                      } else {
                        if (selectPosition == "") {
                          Alert.alert(
                            "Warning",
                            "Tooth position or assessment results are required"
                          );
                        } else {
                          const newAssessmentResult = {
                            position: selectPosition,
                            results: selectedAssessmentItems,
                          };
                          const updateAssessmentResults = [
                            ...assessmentResult,
                            newAssessmentResult,
                          ];
                          setAssessmentResult(updateAssessmentResults);
                          setSelectedAssessmentItems([]);
                          setSelectPosition("");
                          setOpenModalAssessmentResult(false);
                        }
                      }
                    }}
                    label="Add"
                  />
                )}
              </>
            )}
          </View>
        </Modal>
      </View>
    );
  }

  function renderOpenTemplateModal() {
    return (
      <View>
        <Modal isVisible={openTemplate}>
          <View style={[styles.modalStyle2, { padding: moderateScale(10) }]}>
            {examinationTemplateList ? (
              examinationTemplateList.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => handleOnPress(item)}
                    key={`Examination-${index}`}
                  >
                    <Text
                      style={[
                        styles.sentence,
                        { paddingTop: verticalScale(5) },
                      ]}
                    >
                      {item.templateName}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View>
                <Text
                  style={[
                    styles.sentence,
                    { textAlign: "center", paddingLeft: 0 },
                  ]}
                >
                  No template found. Please create one
                </Text>
              </View>
            )}

            <CustomButton
              onPress={() => setOpenTemplate(false)}
              containerStyle={styles.cancelButton}
              label="Cancel"
              labelStyle={styles.cancelButtonLabel}
            />
          </View>
        </Modal>
      </View>
    );
  }

  function resetFields() {
    setPatientName("");
    setPatientDob("");
    setExaminationDate("");
    setPatientIssueSubjective("");
    setPatientIssueObjective("");
    setAssessmentResult([]);
    setNextSteps("");
    setRecommendation("");
    setOtherNote("");
    setDoctorNote("");
    setPaymentMethod("");
    setSelectedItems([]);
    setMedicalTreatmentList([]);
  }

  function enableSignUp() {
    if (
      patientName &&
      patientDob &&
      patientIssueSubjective &&
      patientIssueObjective &&
      assessmentResult &&
      nextSteps &&
      recommendation &&
      otherNote &&
      doctorNote
    ) {
      return true;
    }
    return false;
  }

  return (
    <>
      {Platform.OS == "android" && (
        <View
          style={{
            backgroundColor: "#fff",
            height: 30,
          }}
        />
      )}
      {isImageModalVisible ? (
        <View
          style={{
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
          }}
        >
          <Image
            source={{ uri: imageView }}
            style={{ width: "100%", height: "100%" }}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              top: verticalScale(50),
              left: scale(20),
            }}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Image
              source={imagePath.icArrowLeft}
              style={{
                width: moderateScale(20),
                height: moderateScale(20),
                tintColor: colors.white,
              }}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.arrowImage,
              {
                marginTop: verticalScale(10),
                marginBottom: verticalScale(10),
                marginLeft: scale(16),
              },
            ]}
          >
            <Image source={imagePath.icArrowLeft} style={styles.arrowImage} />
          </TouchableOpacity>
          {renderInputFields()}
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
          {key === "preview" ? (
            <View />
          ) : (
            <View style={styles.buttonStyle}>
              <CustomButton
                onPress={() => resetFields()}
                containerStyle={styles.buttonLayout}
                label="Reset"
              />
              <CustomButton
                loading={loadingExamination}
                disabled={!enableSignUp()}
                containerStyle={{
                  width: moderateScale(165),
                  opacity: enableSignUp() ? 1 : 0.4,
                  marginHorizontal: 0,
                  marginTop: 0,
                  marginBottom: 0,
                }}
                label="Save"
                onPress={
                  key === "editExamination" ? updateExamination : addExamination
                }
              />
            </View>
          )}
          {openModal && renderModal()}
          {openModalAssessmentResult && renderModalAssessmentResult()}
          {openTemplate && renderOpenTemplateModal()}
          {openImageModal && renderSelectImageCategory()}
        </SafeAreaView>
      )}
    </>
  );
};

export default Examination;
