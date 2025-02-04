import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
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
import { CustomButton, CustomTextInput } from "../../../components";
import Modal from "react-native-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import medicationObat from "../../../constants/obat";
import colors from "../../../styles/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
const Prescription = ({ navigation, route }) => {
  const { item, patientIndex, key } = route.params;
  const [openModal, setOpenModal] = useState(false);
  const [keyPrescription, setKeyPrescription] = useState("");
  const [openTemplate, setOpenTemplate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prescriptionTemplateList, setPrescriptionTemplateList] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [examinationDate, setExaminationDate] = useState("");
  const [otherNote, setOtherNote] = useState("");
  const [findMedication, setFindMedication] = useState("");
  const [sex, setSex] = useState("");
  const [quantity, setQuantity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [medicationList, setMedicationList] = useState([]);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [findMedicationThroughSearch, setFindMedicationThroughSearch] =
    useState(false);
  const [editable, setEditable] = useState(false);
  const [date, setDate] = useState(new Date());
  const [datePicker, setDatePicker] = useState(false);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [dataOfPatients, setDataOfPatients] = useState([]);
  const [patientNames, setPatientNames] = useState(false);
  const [filteredPatientNames, setFilteredPatientNames] = useState([]);
  const [indexML, setIndexML] = useState(0);
  const [indexOfPatient, setIndexOfPatient] = useState(0);

  useEffect(() => {
    getTemplates();
    getPatientData();
  }, []);

  useEffect(() => {
    setPatientName(item.patientName || "");
    setDateOfBirth(item.placeDateOfBirth || item.dateOfBirth || "");
    setExaminationDate(item.examinationDate || "");
    setSex(item.sex || "");
    setOtherNote(item.otherNote || "");
    setMedicationList(item.medicationList || []);
  }, []);

  const originalDate = date.toDateString();
  const parsedDate = new Date(originalDate);
  const formattedDate = ` ${getFormattedDate(parsedDate)}`;

  // Adding Data to Firebase
  const addPrescription = async () => {
    setLoadingPrescription(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);

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
            const prescriptionArray = patientData.prescription || [];

            // Add the new examination details to the examination array
            prescriptionArray.push({
              _id:
                Date.now().toString() + Math.random().toString(36).substring(7),
              patientName,
              dateOfBirth,
              sex,
              examinationDate: formattedDate,
              otherNote,
              medicationList,
            });
            userDocData.patients[
              key === "create" ? indexOfPatient : patientIndex
            ].prescription = prescriptionArray;
            await updateDoc(docRef, userDocData);
            Alert.alert("Prescription added successfully");
            setLoadingPrescription(false);
            setOpenModal(false);
            navigation.goBack();
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

  // Updating Data to Firebase

  const updatePrescription = async () => {
    setLoadingPrescription(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(docRef);
        if (userDocSnap.exists()) {
          const userDocData = userDocSnap.data();

          if (userDocData.patients && userDocData.patients[patientIndex]) {
            const patientData = userDocData.patients[patientIndex];
            const prescriptionArray = patientData.prescription || [];
            const indexPres = prescriptionArray.findIndex(
              (pres) => pres._id === item._id
            );
            // Update the examination details in the examination array
            prescriptionArray.splice(indexPres, 1, {
              _id: item._id,
              patientName,
              dateOfBirth,
              examinationDate: formattedDate,
              otherNote,
              sex,
              medicationList,
            });
            userDocData.patients[
              key === "create" ? indexOfPatient : patientIndex
            ].prescription = prescriptionArray;
            await updateDoc(docRef, userDocData);

            Alert.alert("Prescription updated successfully");
            setLoadingPrescription(false);
            navigation.goBack();
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
          setPrescriptionTemplateList(data.prescriptionTemplate);
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
      Alert.alert("No user sign in");
    }
  };

  // Handler
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

  const handleOnPress = (item) => {
    setMedicationList(item.medicineList);
    setOpenTemplate(false);
  };

  const handleFindMedicationChange = (text) => {
    setFindMedication(text);
    const filteredTerms = medicationObat.filter((term) =>
      term.name.toLowerCase().startsWith(text.toLowerCase())
    );
    if (text === "") {
      setFindMedicationThroughSearch(false);
    } else {
      setFindMedicationThroughSearch(true);
      setFilteredMedications(filteredTerms);
    }
  };

  const onAddMedicationList = () => {
    const data = {
      findMedication,
      quantity,
      instructions,
    };
    setMedicationList([...medicationList, data]);
    setFindMedication("");
    setQuantity("");
    setInstructions("");
    setOpenModal(false);
    setFindMedicationThroughSearch(false);
  };

  const onDeleteMedicationList = (index) => {
    const updatedMedicineList = [...medicationList];
    updatedMedicineList.splice(index, 1);
    setMedicationList(updatedMedicineList);
  };

  const backDropPress = () => {
    setOpenModal(false);
    setFindMedication("");
    setQuantity("");
    setInstructions("");
    setKeyPrescription("");
  };

  const handleEditMedicationList = (item, index) => {
    setOpenModal(true);
    setFindMedication(item.findMedication);
    setQuantity(item.quantity);
    setInstructions(item.instructions);
    setKeyPrescription("edit");
    setIndexML(index);
  };

  const onEditMedicationList = () => {
    const updatedMedicineList = [...medicationList];
    updatedMedicineList[indexML] = {
      findMedication,
      quantity,
      instructions,
    };

    setMedicationList(updatedMedicineList);
    setFindMedication("");
    setQuantity("");
    setInstructions("");
    setOpenModal(false);
    setKeyPrescription("");
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

  function renderInputFields() {
    return (
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
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
        <Text style={styles.title}>Patient Name </Text>
        <CustomTextInput
          editable={key === "fromPatientProfile" ? false : true}
          value={patientName}
          onChangeValue={handleFindPatientNameChange}
          containerStyle={styles.textInputColor}
          inputStyle={{
            color: key === "create" || editable ? colors.black : colors.gray03,
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
                      setPatientName(selectedPatient.patientName);
                      setDateOfBirth(selectedPatient.placeDateOfBirth);
                      setSex(selectedPatient.sex);
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
                >
                  <Text style={styles.objectiveItemTitle}>
                    {patient.patientName}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : null}

        <Text style={styles.title}>Date of Birth</Text>
        <CustomTextInput
          editable={key === "fromPatientProfil" ? true : editable}
          value={dateOfBirth}
          onChangeValue={(text) => setDateOfBirth(text)}
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

        <Text style={styles.title}>Examination Date</Text>
        <CustomTextInput
          // editable={key === 'preview' ? false : true}
          editable={key === "fromPatientProfil" ? true : editable}
          value={key === "preview" ? examinationDate : formattedDate}
          onChangeValue={(text) => setExaminationDate(text)}
          containerStyle={styles.textInputColor}
          inputStyle={{ color: editable ? colors.black : colors.gray03 }}
        />

        <Text style={styles.title}>Other Note</Text>
        <CustomTextInput
          editable={key === "preview" ? false : true}
          multiline={true}
          value={otherNote}
          onChangeValue={(text) => setOtherNote(text)}
          containerStyle={styles.textInputColor}
        />

        <View style={styles.medicalTreatmentCont}>
          <Text style={styles.title}>Medication List</Text>
          {key === "preview" ? (
            <View />
          ) : (
            <TouchableOpacity onPress={() => setOpenModal(true)}>
              <Image source={imagePath.icPlus} style={styles.plusStyle} />
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.container3, { padding: scale(16) }]}>
          {medicationList &&
            medicationList.map((item, index) => {
              return (
                <View
                  key={`MedicineListInPrescriptionTemplate-${index}`}
                  style={styles.medicationContent}
                >
                  <View style={{ width: moderateScale(100) }}>
                    <Text style={styles.findMedication2}>
                      {item.findMedication}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: moderateScale(50),
                      marginLeft: scale(5),
                    }}
                  >
                    <Text style={[styles.quantity, { paddingLeft: 0 }]}>
                      {item.quantity}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: moderateScale(100),
                      marginLeft: scale(5),
                    }}
                  >
                    <Text
                      style={[styles.instructions, { paddingRight: scale(10) }]}
                    >
                      {item.instructions}
                    </Text>
                  </View>

                  {key === "preview" ? (
                    <View />
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleEditMedicationList(item, index)}
                    >
                      <Image
                        resizeMode="contain"
                        source={imagePath.icEditIcon}
                        style={[
                          styles.editIconImage,
                          {
                            marginRight: scale(5),
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  )}
                  {key === "preview" ? (
                    <View />
                  ) : (
                    <TouchableOpacity
                      onPress={() => onDeleteMedicationList(index)}
                    >
                      <Image
                        resizeMode="contain"
                        source={imagePath.icDelete}
                        style={[
                          styles.editIconImage,
                          {
                            tintColor: colors.red,
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
        </View>
        {key === "preview" ? (
          <View />
        ) : (
          <View style={styles.buttonStyle}>
            <CustomButton containerStyle={styles.buttonLayout} label="Reset" />
            <CustomButton
              onPress={
                key === "editPrescription"
                  ? updatePrescription
                  : addPrescription
              }
              loading={loadingPrescription}
              containerStyle={styles.buttonLayout2}
              label={key === "editPrescription" ? "Update" : "Save"}
            />
          </View>
        )}
      </KeyboardAwareScrollView>
    );
  }

  function renderModal() {
    return (
      <View>
        <Modal onBackdropPress={backDropPress} isVisible={openModal}>
          <View style={styles.modalStyle2}>
            <View>
              <CustomTextInput
                value={findMedication}
                multiline={true}
                onChangeValue={handleFindMedicationChange}
                placeholder="Find Medication"
                containerStyle={styles.findMedication}
                placeholderTextColor={colors.gray03}
                inputStyle={{
                  paddingHorizontal: scale(10),
                }}
              />
              {findMedicationThroughSearch ? (
                <ScrollView style={styles.medicationList}>
                  {filteredMedications.length === 0 ? (
                    <>{setFindMedicationThroughSearch(false)}</>
                  ) : (
                    filteredMedications.map((medication, index) => (
                      <TouchableOpacity
                        style={styles.medicationItem}
                        key={medication.id}
                        onPress={() => {
                          setFindMedication(medication.name);
                          setFilteredMedications([]);
                          setFindMedicationThroughSearch(false);
                        }}
                      >
                        <Text style={styles.medicationItemText}>
                          {medication.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CustomTextInput
                value={quantity}
                onChangeValue={(text) => setQuantity(text)}
                placeholder="Quantity"
                containerStyle={styles.quantityInstuction}
                keyboardType={"default"}
                placeholderTextColor={colors.gray03}
              />
              <CustomTextInput
                value={instructions}
                onChangeValue={(text) => setInstructions(text)}
                placeholder="Instructions"
                containerStyle={styles.quantityInstuction2}
                placeholderTextColor={colors.gray03}
                inputStyle={{
                  paddingHorizontal: scale(10),
                }}
              />
            </View>
            <CustomButton
              containerStyle={styles.addContainer}
              label={keyPrescription === "edit" ? "Update" : "Add"}
              onPress={
                keyPrescription === "edit"
                  ? onEditMedicationList
                  : onAddMedicationList
              }
              loading={loading}
            />
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
            {prescriptionTemplateList ? (
              prescriptionTemplateList.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => handleOnPress(item, index)}
                    key={`Prescription-${index}`}
                  >
                    <Text
                      style={[
                        styles.sentence,
                        { paddingTop: verticalScale(5) },
                      ]}
                    >
                      {item.prescriptionTemplateName}
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
                  "No template found. Please create one.
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
    <GestureHandlerRootView style={styles.container}>
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
        {openModal && renderModal()}
        {openTemplate && renderOpenTemplateModal()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Prescription;
