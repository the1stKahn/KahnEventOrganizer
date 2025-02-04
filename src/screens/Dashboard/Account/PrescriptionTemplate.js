import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import React, { useState } from "react";
import styles from "./styles";
import imagePath from "../../../constants/imagePath";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../../../styles/responsiveSize";
import { CustomButton, CustomTextInput } from "../../../components";
import Modal from "react-native-modal";
import { auth, db } from "../../../database/firebase";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import navigationStrings from "../../../constants/navigationStrings";
import medicationObat from "../../../constants/obat";
import colors from "../../../styles/colors";

const PrescriptionTemplate = ({ navigation, route }) => {
  const { item, itemIndex } = route.params;
  const [openModal, setOpenModal] = useState(false);
  const [findMedicationThroughSearch, setFindMedicationThroughSearch] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [findMedication, setFindMedication] = useState("");
  const [quantity, setQuantity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [key, setKey] = useState("");
  const [indexML, setIndexML] = useState(0);

  const [filteredMedications, setFilteredMedications] = useState([]);
  const [prescriptionTemplateName, setPrescriptionTemplateName] = useState(
    item ? item.prescriptionTemplateName : ""
  );
  const [medicineList, setMedicineList] = useState(
    item ? item.medicineList : []
  );

  // Updating Data to Firebase

  const handleUpdate = async () => {
    setLoadingPrescription(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const prescriptionTemplates = docSnap.exists()
          ? docSnap.data().prescriptionTemplate
          : [];
        if (itemIndex >= 0 && itemIndex < prescriptionTemplates.length) {
          const updatedItem = {
            ...prescriptionTemplates[itemIndex],
            prescriptionTemplateName,
            medicineList,
          };
          prescriptionTemplates[itemIndex] = updatedItem;
          await updateDoc(docRef, {
            prescriptionTemplate: prescriptionTemplates,
          });
          setLoadingPrescription(false);
          Alert.alert("Prescription template updated successfully");
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error("Error updating prescription template:", error);
    }
  };

  // Handler
  const onAddMedicationList = () => {
    const data = {
      findMedication,
      quantity,
      instructions,
    };
    setMedicineList([...medicineList, data]);
    setFindMedication("");
    setQuantity("");
    setInstructions("");
    setOpenModal(false);
  };

  const addPrescriptionTemplate = async () => {
    setLoadingPrescription(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);

        await updateDoc(docRef, {
          prescriptionTemplate: arrayUnion({
            prescriptionTemplateName,
            medicineList,
          }),
        });
        Alert.alert("Prescription Template added successfully ");
        setLoadingPrescription(false);
        navigation.navigate(navigationStrings.TEMPLATES);
      } catch (error) {
        console.log(error);
        console.log(error.message);
      }
    }
  };

  const onEditMedicationList = () => {
    const updatedMedicineList = [...medicineList];
    updatedMedicineList[indexML] = {
      findMedication,
      quantity,
      instructions,
    };

    setMedicineList(updatedMedicineList);
    setFindMedication("");
    setQuantity("");
    setInstructions("");
    setOpenModal(false);
    setKey("");
  };

  const backDropPress = () => {
    setOpenModal(false);
    setFindMedication("");
    setQuantity("");
    setInstructions("");
    setKey("");
  };

  const onDeleteMedicationList = (index) => {
    const updatedMedicineList = [...medicineList];
    updatedMedicineList.splice(index, 1);
    setMedicineList(updatedMedicineList);
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

  const handleEditMedicationList = (item, index) => {
    setOpenModal(true);
    setFindMedication(item.findMedication);
    setQuantity(item.quantity);
    setInstructions(item.instructions);
    setKey("edit");
    setIndexML(index);
  };

  // Render
  function renderInputFields() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Template Name</Text>
        <CustomTextInput
          multiline={true}
          value={prescriptionTemplateName}
          onChangeValue={(text) => setPrescriptionTemplateName(text)}
          containerStyle={styles.textInputColor}
        />

        <View style={styles.medicalTreatmentCont}>
          <Text style={styles.title}>Medication List</Text>
          <TouchableOpacity onPress={() => setOpenModal(true)}>
            <Image source={imagePath.icPlus} style={styles.plusStyle} />
          </TouchableOpacity>
        </View>
        <View style={[styles.container3, { padding: scale(16) }]}>
          {medicineList &&
            medicineList.map((item, index) => {
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
                </View>
              );
            })}
        </View>
        <View style={styles.buttonStyle}>
          <CustomButton containerStyle={styles.buttonLayout} label="Reset" />
          <CustomButton
            disabled={prescriptionTemplateName == "" ? true : false}
            containerStyle={{
              width: moderateScale(165),
              opacity: prescriptionTemplateName == "" ? 0.5 : 1,
            }}
            loading={loadingPrescription}
            onPress={item ? handleUpdate : addPrescriptionTemplate}
            label={item ? "Update" : "Save"}
          />
        </View>
      </View>
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
                onChangeValue={handleFindMedicationChange}
                placeholder="Find Medication"
                containerStyle={styles.findMedication}
                multiline={true}
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
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <CustomTextInput
                value={quantity}
                keyboardType={"default"}
                onChangeValue={(text) => setQuantity(text)}
                placeholder="Quantity"
                containerStyle={styles.quantityInstuction}
                inputStyle={{
                  paddingHorizontal: scale(10),
                }}
              />
              <CustomTextInput
                value={instructions}
                onChangeValue={(text) => setInstructions(text)}
                placeholder="Instructions"
                containerStyle={styles.quantityInstuction2}
                inputStyle={{
                  paddingHorizontal: scale(10),
                }}
              />
            </View>
            <CustomButton
              containerStyle={styles.addContainer}
              label={key === "edit" ? "Update" : "Add"}
              onPress={
                key === "edit" ? onEditMedicationList : onAddMedicationList
              }
              loading={loading}
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
      {openModal && renderModal()}
    </SafeAreaView>
  );
};

export default PrescriptionTemplate;
