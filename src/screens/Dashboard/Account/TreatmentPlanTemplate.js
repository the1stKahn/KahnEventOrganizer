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
import React, { useState } from "react";
import styles from "./styles";
import imagePath from "../../../constants/imagePath";
import { scale, verticalScale } from "../../../styles/responsiveSize";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CustomButton, CustomTextInput } from "../../../components";
import Modal from "react-native-modal";
import CheckBox from "expo-checkbox";
import { auth, db } from "../../../database/firebase";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import navigationStrings from "../../../constants/navigationStrings";

const TreatmentPlanTemplate = ({ navigation, route }) => {
  const { item, itemIndex } = route.params;
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [treatmentTemplateName, setTreatmentTemplateName] = useState(
    item ? item.treatmentTemplateName : ""
  );
  const [nextSteps, setNextSteps] = useState(item ? item.nextSteps : "");
  const [recommendation, setRecommendation] = useState(
    item ? item.recommendation : ""
  );
  const [doctorPersonalNote, setDoctorPersonalNote] = useState(
    item ? item.doctorPersonalNote : ""
  );
  const [otherNotes, setOtherNotes] = useState(item ? item.otherNotes : "");
  const [selectedItems, setSelectedItems] = useState([]);
  const [medicalTreatmentList, setMedicalTreatmentList] = useState([]);

  React.useEffect(() => {
    getMedicalTreatment();
  }, []);

  // Update Data to Firebase

  const handleUpdate = async () => {
    setLoadingTemplate(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const treatmentTemplates = docSnap.exists()
          ? docSnap.data().treatmentTemplate
          : [];
        const selectedMedicalTreatments = selectedItems.map(
          (index) => medicalTreatmentList[index]
        );
        if (itemIndex >= 0 && itemIndex < treatmentTemplates.length) {
          const updatedItem = {
            ...treatmentTemplates[itemIndex],
            treatmentTemplateName,
            nextSteps,
            recommendation,
            doctorPersonalNote,
            otherNotes,
            medicalTreatment: selectedMedicalTreatments,
          };
          treatmentTemplates[itemIndex] = updatedItem;
          await updateDoc(docRef, {
            treatmentTemplate: treatmentTemplates,
          });
          setLoadingTemplate(false);
          Alert.alert("Treatment template updated successfully");
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error("Error updating Treatment template:", error);
    }
  };

  //  Getting Data from Firebase

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

  const addTreatmentTemplate = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const selectedMedicalTreatments = selectedItems.map(
          (index) => medicalTreatmentList[index]
        );
        await updateDoc(docRef, {
          treatmentTemplate: arrayUnion({
            treatmentTemplateName,
            nextSteps,
            recommendation,
            doctorPersonalNote,
            otherNotes,
            priceOfMedicalTreatment: selectedMedicalTreatments,
          }),
        });
        Alert.alert("Treatment template added successfully");
        resetFields();
        setLoading(false);
        navigation.navigate(navigationStrings.TEMPLATES);
      } catch (error) {
        console.log(error);
        console.log(error.message);
      }
    }
  };

  // Handlers

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
        }}
      >
        <Text style={styles.sentence}>
          {item?.medicalTreatment} - Rp {item?.pricePerUnit}
        </Text>
        <TouchableOpacity onPress={() => handleDeleteMedicalTreatment(index)}>
          <Image source={imagePath.icDelete} style={styles.deleteContainer} />
        </TouchableOpacity>
      </View>
    );
  };

  const calculateTotalPrice = () => {
    const totalPrice = selectedItems.reduce((acc, index) => {
      const items = medicalTreatmentList[index];
      const pricePerUnit = parseInt(items.pricePerUnit, 10);
      return acc + pricePerUnit;
    }, 0);

    return totalPrice;
  };

  const calculateTotalPriceEdit = () => {
    const totalPrice = item?.priceOfMedicalTreatment.reduce((acc, item) => {
      const pricePerUnit = parseInt(item.pricePerUnit, 10) || 0;
      return acc + pricePerUnit;
    }, 0);

    return totalPrice;
  };

  const resetFields = () => {
    setTreatmentTemplateName("");
    setNextSteps("");
    setRecommendation("");
    setDoctorPersonalNote("");
    setOtherNotes("");
    setSelectedItems([]);
  };
  // Render
  function renderInputFields() {
    return (
      <KeyboardAwareScrollView
        contentContainerStyle={{ marginHorizontal: scale(16) }}
        style={styles.container}
      >
        {/* 1 */}
        <Text style={styles.title}>Template Name</Text>
        <CustomTextInput
          multiline={true}
          value={treatmentTemplateName}
          onChangeValue={(text) => setTreatmentTemplateName(text)}
          containerStyle={styles.textInputColor}
        />
        {/* 2 */}
        <Text style={styles.title}>Next Steps</Text>
        <CustomTextInput
          multiline={true}
          value={nextSteps}
          onChangeValue={(text) => setNextSteps(text)}
          containerStyle={styles.textInputColor}
        />
        {/* 3*/}
        <View style={styles.medicalTreatmentCont}>
          <Text style={styles.title}>Medical Treatment</Text>
          <TouchableOpacity onPress={() => setOpenModal(true)}>
            <Image source={imagePath.icPlus} style={styles.plusStyle} />
          </TouchableOpacity>
        </View>
        <View style={styles.container3}>
          <FlatList
            scrollEnabled={false}
            contentContainerStyle={styles.flatListContainerStyle}
            data={
              item && selectedItems.length === 0
                ? item.priceOfMedicalTreatment
                : selectedItems.map((index) => medicalTreatmentList[index])
            }
            renderItem={({ item, index }) => selectedMedicalItems(item, index)}
            keyExtractor={(item, index) => index.toString()}
          />
          <Text style={styles.totalText}>
            Total: Rp{" "}
            {item
              ? item.priceOfMedicalTreatment && selectedItems.length === 0
                ? calculateTotalPriceEdit()
                : calculateTotalPrice()
              : calculateTotalPrice()}
          </Text>
        </View>
        {/* 4 */}
        <Text style={styles.title}>Recommendations & Restrictions</Text>
        <CustomTextInput
          multiline={true}
          value={recommendation}
          onChangeValue={(text) => setRecommendation(text)}
          containerStyle={styles.textInputColor}
        />
        {/*5 */}
        <Text style={styles.title}>Other Notes (Shared with Patient)</Text>
        <CustomTextInput
          multiline={true}
          value={otherNotes}
          onChangeValue={(text) => setOtherNotes(text)}
          containerStyle={styles.textInputColor}
        />
        {/*6*/}
        <Text style={styles.title}>Doctor's Personal Note (Not Shared)</Text>
        <CustomTextInput
          multiline={true}
          value={doctorPersonalNote}
          onChangeValue={(text) => setDoctorPersonalNote(text)}
          containerStyle={styles.textInputColor}
        />
      </KeyboardAwareScrollView>
    );
  }

  function renderModal() {
    return (
      <View>
        <Modal
          onBackdropPress={() => setOpenModal(false)}
          isVisible={openModal}
        >
          <View style={styles.modalStyle}>
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
              <FlatList
                contentContainerStyle={styles.flatListContainer}
                data={medicalTreatmentList}
                renderItem={({ item, index }) => (
                  <View
                    key={`ListOfMedicalItem-${index}`}
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
            )}

            <CustomButton
              onPress={() => setOpenModal(false)}
              containerStyle={styles.addContainer}
              label={medicalTreatmentList === undefined ? "Cancel" : "Add"}
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
      <View style={styles.buttonStyle}>
        <CustomButton
          onPress={() => resetFields()}
          containerStyle={styles.buttonLayout}
          label="Reset"
        />
        <CustomButton
          onPress={item ? handleUpdate : addTreatmentTemplate}
          loading={loading}
          disabled={treatmentTemplateName === "" ? true : false}
          containerStyle={{
            width: scale(150),
            opacity: treatmentTemplateName === "" ? 0.5 : 1,
          }}
          label={item ? "Update" : "Add"}
        />
      </View>
      {openModal && renderModal()}
    </SafeAreaView>
  );
};

export default TreatmentPlanTemplate;
