import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import imagePath from "../../../constants/imagePath";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../../../styles/responsiveSize";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CustomButton, CustomTextInput } from "../../../components";
import Modal from "react-native-modal";
import CheckBox from "expo-checkbox";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import colors from "../../../styles/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

const TreatmentPlan = ({ navigation, route }) => {
  const { item, patientIndex, key } = route.params;
  const [openModal, setOpenModal] = useState(false);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [examinationDate, setExaminationDate] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [sex, setSex] = useState("");
  const [address, setAddress] = useState("");
  const [medicalTreatment, setMedicalTreatment] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  const [otherNote, setOtherNote] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [treatmentTemplateList, setTreatmentTemplateList] = useState([]);
  const [medicalTreatmentList, setMedicalTreatmentList] = useState([]);
  const [medicalTreatmentList2, setMedicalTreatmentList2] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [date, setDate] = useState(new Date());
  const [datePicker, setDatePicker] = useState(false);
  const [editable, setEditable] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [dataOfPatients, setDataOfPatients] = useState([]);
  const [patientNames, setPatientNames] = useState(false);
  const [filteredPatientNames, setFilteredPatientNames] = useState([]);
  const [indexOfPatient, setIndexOfPatient] = useState(0);

  useEffect(() => {
    setPatientName(item.patientName || "");
    setPatientDob(item.placeDateOfBirth || item.patientDob || "");
    setExaminationDate(item.examinationDate || "");
    setNextSteps(item.nextSteps || "");
    setMedicalTreatmentList2(item.medicalTreatment || []);
    setRecommendation(item.recommendation || "");
    setOtherNote(item.otherNote || "");
    setDoctorNote(item.doctorNote || "");
    setSex(item.sex || "");
    setAddress(item.address || item.homeAddress || "");
  }, []);

  useEffect(() => {
    getTemplates();
    getMedicalTreatment();
    getPatientData();
  }, []);

  const originalDate = date.toDateString();
  const parsedDate = new Date(originalDate);
  const formattedDate = ` ${getFormattedDate(parsedDate)}`;

  // Add Treatment Template to firebase

  const addTreatment = async () => {
    setLoadingTreatment(true);
    const user = auth.currentUser;
    if (user) {
      try {
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
            const treatmentArray = patientData.treatment || [];
            treatmentArray.push({
              _id:
                Date.now().toString() + Math.random().toString(36).substring(7),
              patientName,
              patientDob,
              examinationDate: formattedDate,
              nextSteps,
              recommendation,
              otherNote,
              doctorNote,
              address,
              sex,
              medicalTreatment:
                medicalTreatmentList2?.length > 0
                  ? medicalTreatmentList2
                  : selectedMedicalTreatments,
            });
            userDocData.patients[
              key === "create" ? indexOfPatient : patientIndex
            ].treatment = treatmentArray;
            await updateDoc(docRef, userDocData);

            Alert.alert("Treatment added successfully");
            resetFields();
            setLoadingTreatment(false);
            setOpenModal(false);
            navigation.goBack();
          } else {
            Alert.alert("Invalid patient index or patients array not found.");
          }
        } else {
          Alert.alert("User document not found.");
        }
      } catch (error) {
        Alert.alert(error.message);
      }
    }
  };

  // Updating Data to Firebase
  const updateTreatment = async () => {
    setLoadingTreatment(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const selectedMedicalTreatments = selectedItems.map(
          (index) => medicalTreatmentList[index]
        );
        const userDocSnap = await getDoc(docRef);
        if (userDocSnap.exists()) {
          const userDocData = userDocSnap.data();

          if (userDocData.patients && userDocData.patients[patientIndex]) {
            const patientData = userDocData.patients[patientIndex];
            const treatmentArray = patientData.treatment || [];
            const indexTreat = treatmentArray.findIndex(
              (treat) => treat._id === item._id
            );
            treatmentArray.splice(indexTreat, 1, {
              _id: item._id,
              patientName,
              sex,
              address,
              patientDob,
              examinationDate: formattedDate,
              nextSteps,
              recommendation,
              otherNote,
              doctorNote,
              medicalTreatment:
                medicalTreatmentList2?.length > 0
                  ? medicalTreatmentList2
                  : selectedMedicalTreatments,
            });
            userDocData.patients[
              key === "create" ? indexOfPatient : patientIndex
            ].treatment = treatmentArray;
            await updateDoc(docRef, userDocData);

            Alert.alert("Treatment updated successfully");
            resetFields();
            setLoadingTreatment(false);
            setOpenModal(false);
            navigation.goBack();
          } else {
            Alert.alert("Invalid patient index or patients array not found.");
          }
        } else {
          Alert.alert("User document not found.");
        }
      } catch (error) {
        Alert.alert(error.message);
      }
    }
  };

  // Getting Data from Firebase
  const getTemplates = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTreatmentTemplateList(data.treatmentTemplate);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

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
      Alert.alert("NO user sign in");
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

  // Delete Treatment from firebase

  const handleDeleteTreatment = async (index) => {
    Alert.alert("Deleting treatment...");
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("User not authenticated.");
      setLoadingTreatment(false);
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(docRef);
      const userDocData = userDocSnap.data();
      const patients = userDocData.patients || [];
      const patientData = patients[patientIndex];
      const treatmentArray = patientData.treatment || [];

      // Find the index of the treatment item with a matching _id
      const indexTreat = treatmentArray.findIndex(
        (treat) => treat._id === item._id
      );
      if (indexTreat === -1) {
        Alert.alert("Treatment item not found.");
        setLoadingTreatment(false);
        return;
      }

      const treatmentItem = treatmentArray[indexTreat];
      const medicalTreatmentArray = treatmentItem.medicalTreatment || [];
      medicalTreatmentArray.splice(index, 1);

      // Update the user document
      treatmentItem.medicalTreatment = medicalTreatmentArray;
      treatmentArray[indexTreat] = treatmentItem;
      patientData.treatment = treatmentArray;
      patients[patientIndex] = patientData;
      userDocData.patients = patients;
      await updateDoc(docRef, userDocData);

      Alert.alert("Medical Treatment deleted successfully");
      setMedicalTreatmentList2(medicalTreatmentArray);
      setOpenModal(false);
    } catch (error) {
      Alert.alert(
        "An error occurred while deleting medical treatment: " + error.message
      );
    }
  };

  // Handlers

  const deleteAlertTreat = (ind) => {
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
          onPress: () => handleDeleteTreatment(ind),
          style: "destructive",
        },
      ]
    );
  };

  const handleFindPatientNameChange = (text) => {
    setPatientName(text);
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

  const handleDeleteMedicalTreatment = (index) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems.splice(index, 1);
    setSelectedItems(newSelectedItems);
  };

  const selectedMedicalItems = (item, index) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginRight: 20,
          marginTop: verticalScale(10),
        }}
      >
        <Text style={styles.sentence}>
          {item.medicalTreatment} - Rp {item.pricePerUnit}
        </Text>
        <TouchableOpacity
          onPress={
            key === "editTreatment"
              ? () => deleteAlertTreat(index)
              : () => handleDeleteMedicalTreatment(index)
          }
        >
          {key === "preview" ? (
            <View />
          ) : (
            <Image
              source={imagePath.icDelete}
              style={{
                width: moderateScale(20),
                height: moderateScale(20),
                tintColor: colors.red,
              }}
            />
          )}
        </TouchableOpacity>
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

  const handleOnPress = (item) => {
    setDoctorNote(item.doctorPersonalNote);
    setNextSteps(item.nextSteps);
    setOtherNote(item.otherNotes);
    setNextSteps(item.nextSteps);
    setRecommendation(item.recommendation);
    setMedicalTreatmentList2(item.priceOfMedicalTreatment);
    setOpenTemplate(false);
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

  function enableSignUp() {
    if (
      patientName &&
      patientDob &&
      nextSteps &&
      medicalTreatment &&
      recommendation &&
      otherNote &&
      doctorNote
    ) {
      return true;
    }
    return false;
  }

  function resetFields() {
    setPatientName("");
    setPatientDob("");
    setExaminationDate("");
    setNextSteps("");
    setMedicalTreatment([]);
    setRecommendation("");
    setOtherNote("");
    setDoctorNote("");
  }

  function renderInputFields() {
    return (
      <GestureHandlerRootView style={styles.container}>
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
            editable={key === "fromPatientProfil" ? false : true}
            value={patientName}
            onChangeValue={handleFindPatientNameChange}
            containerStyle={styles.textInputColor}
            inputStyle={{ color: editable ? colors.black : colors.gray03 }}
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
                        //setPatientDetails(selectedPatient);
                        setPatientName(selectedPatient.patientName);
                        setPatientDob(selectedPatient.placeDateOfBirth);
                        setSex(selectedPatient.sex);
                        setAddress(selectedPatient.homeAddress);
                        setPatientNames(false);
                        const indexOfSelectedPatient =
                          dataOfPatients.indexOf(selectedPatient);
                        console.log(indexOfSelectedPatient);
                        setIndexOfPatient(indexOfSelectedPatient);
                      } else {
                        console.error(
                          "Selected patient not found in dataOfPatients"
                        );
                      }
                    }}
                    style={styles.objectiveItemContainer}
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
          <Text style={styles.title}>Date of Birth</Text>
          <CustomTextInput
            editable={key === "fromPatientProfil" ? true : editable}
            value={patientDob}
            onChangeValue={(text) => setPatientDob(text)}
            containerStyle={styles.textInputColor}
            inputStyle={{ color: editable ? colors.black : colors.gray03 }}
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
            editable={key === "fromPatientProfil" ? true : editable}
            value={key === "preview" ? examinationDate : formattedDate}
            onChangeValue={(text) => setExaminationDate(text)}
            containerStyle={styles.textInputColor}
            inputStyle={{ color: editable ? colors.black : colors.gray03 }}
          />

          {/* 4 */}
          <Text style={styles.title}>Next Steps</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={nextSteps}
            onChangeValue={(text) => setNextSteps(text)}
            containerStyle={styles.textInputColor}
          />

          {/* 5 */}
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
          <View style={styles.container3}>
            <FlatList
              scrollEnabled={false}
              contentContainerStyle={styles.flatListContainerStyle}
              data={
                medicalTreatmentList2 && selectedItems.length === 0
                  ? medicalTreatmentList2
                  : selectedItems.map((index) => medicalTreatmentList[index])
              }
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

          {/* 6*/}
          <Text style={styles.title}>"Recommendations & Restrictions</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={recommendation}
            onChangeValue={(text) => setRecommendation(text)}
            containerStyle={styles.textInputColor}
          />
          {/*7 */}
          <Text style={styles.title}>Other Notes</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={otherNote}
            onChangeValue={(text) => setOtherNote(text)}
            containerStyle={styles.textInputColor}
          />
          {/* 8 */}
          <Text style={styles.title}>Doctor's Personal Note (Not Shared)</Text>
          <CustomTextInput
            editable={key === "preview" ? false : true}
            multiline={true}
            value={doctorNote}
            onChangeValue={(text) => setDoctorNote(text)}
            containerStyle={styles.textInputColor}
          />
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
                  No setup found. Please create one first.
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  contentContainerStyle={styles.flatListContainer}
                  data={medicalTreatmentList}
                  renderItem={({ item, index }) => (
                    <View
                      key={`TreatmentMedical-${index}`}
                      style={styles.CheckBoxContainer}
                    >
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

                <CustomButton onPress={() => setOpenModal(false)} label="Add" />
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
          <View style={[styles.modalStyle, { height: "auto", padding: 10 }]}>
            {treatmentTemplateList ? (
              treatmentTemplateList.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => handleOnPress(item)}
                    key={`TreatmentTemplateinTreatmentScreen-${index}`}
                  >
                    <Text
                      style={[
                        styles.sentence,
                        { paddingTop: verticalScale(5) },
                      ]}
                    >
                      {item.treatmentTemplateName}
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
                  No template found. Please create one.
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

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS == "android" && (
        <View
          style={{
            height: 30,
            backgroundColor: "#fff",
          }}
        />
      )}
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
            onPress={resetFields}
            containerStyle={styles.buttonLayout}
            label="Reset"
          />
          <CustomButton
            disabled={!enableSignUp()}
            loading={loadingTreatment}
            onPress={key === "editTreatment" ? updateTreatment : addTreatment}
            containerStyle={{
              width: moderateScale(165),
              opacity: enableSignUp() ? 1 : 0.4,
              marginHorizontal: 0,
              marginTop: 0,
              marginBottom: 0,
            }}
            label={key === "editTreatment" ? "Update" : "Add"}
          />
        </View>
      )}
      {openModal && renderModal()}
      {openTemplate && renderOpenTemplateModal()}
    </SafeAreaView>
  );
};

export default TreatmentPlan;
