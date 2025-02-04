import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
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
import { auth, db } from "../../../database/firebase";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { objective } from "../../../constants/objective";
import SearchableDropdown from "react-native-searchable-dropdown";
import { toothPosition } from "../../../constants/toothPosition";

const ExaminationTemplate = ({ navigation, route }) => {
  const { item, itemIndex, key } = route.params;
  const [openModal, setOpenModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [medicalTreatmentList, setMedicalTreatmentList] = useState([]);
  const [templateName, setTemplateName] = useState(
    item ? item.templateName : ""
  );
  const [patientIssueSubjective, setPatientIssueSubjective] = useState(
    item ? item.patientIssueSubjective : ""
  );
  const [patientIssueObjective, setPatientIssueObjective] = useState(
    item ? item.patientIssueObjective : ""
  );
  const [assessmentResult, setAssessmentResult] = useState(
    item ? item.assessmentResult : []
  );
  const [nextSteps, setNextSteps] = useState(item ? item.nextSteps : "");
  const [recommendation, setRecommendation] = useState(
    item ? item.recommendation : ""
  );
  const [doctorPersonalNote, setDoctorPersonalNote] = useState(
    item ? item.doctorPersonalNote : ""
  );
  const [otherNotes, setOtherNotes] = useState(item ? item.otherNotes : "");

  const [filterText, setFilterText] = useState("");
  const [filterTextAssessment, setFilterTextAssessment] = useState("");
  const [diagnose, setDiagnose] = useState(objective);
  const [selectPosition, setSelectPosition] = useState("");
  const [selectedAssessmentItems, setSelectedAssessmentItems] = useState([]);
  const [isVisibleSearchAssessmentItem, setIsVisibleSearchAssessmentItem] =
    useState(false);
  const [openModalAssessmentResult, setOpenModalAssessmentResult] =
    useState(false);

  useEffect(() => {
    getMedicalTreatment();
  }, []);

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

  // Updating Data to Firebase

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const examinationTemplates = docSnap.exists()
          ? docSnap.data().examinationTemplate
          : [];
        const selectedMedicalTreatments = selectedItems.map(
          (index) => medicalTreatmentList[index]
        );
        if (itemIndex >= 0 && itemIndex < examinationTemplates.length) {
          const updatedItem = {
            ...examinationTemplates[itemIndex],
            templateName,
            patientIssueSubjective,
            patientIssueObjective,
            assessmentResult,
            nextSteps,
            recommendation,
            doctorPersonalNote,
            otherNotes,

            medicalTreatment: selectedMedicalTreatments,
          };
          examinationTemplates[itemIndex] = updatedItem;
          await updateDoc(docRef, {
            examinationTemplate: examinationTemplates,
          });
          setLoading(false);
          Alert.alert("Examination template updated successfully");
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error("Error updating Exmination template:", error);
    }
  };

  // Adding Data to Firebase

  const addExaminationTemplate = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const selectedMedicalTreatments = selectedItems.map(
          (index) => medicalTreatmentList[index]
        );
        await updateDoc(docRef, {
          examinationTemplate: arrayUnion({
            templateName,
            patientIssueSubjective,
            patientIssueObjective,
            assessmentResult,
            nextSteps,
            recommendation,
            doctorPersonalNote,
            otherNotes,

            medicalTreatment: selectedMedicalTreatments,
          }),
        });
        Alert.alert("Examination template added successfully");
        resetFields();
        setLoading(false);
        setOpenModal(false);
        navigation.goBack();
      } catch (error) {
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

  const handleDeleteAddAssessmentResult = async (index) => {
    const newAssessmentResult = [...assessmentResult];
    newAssessmentResult.splice(index, 1);
    setAssessmentResult(newAssessmentResult);
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
          {item.medicalTreatment} - Rp {item.pricePerUnit}
        </Text>
        <TouchableOpacity onPress={() => handleDeleteMedicalTreatment(index)}>
          <Image source={imagePath.icDelete} style={styles.deleteContainer} />
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
    const totalPrice = item?.medicalTreatment.reduce((acc, item) => {
      const pricePerUnit = parseInt(item.pricePerUnit, 10) || 0;
      return acc + pricePerUnit;
    }, 0);

    return totalPrice;
  };

  const resetFields = () => {
    setTemplateName("");
    setPatientIssueSubjective("");
    setPatientIssueObjective("");
    setAssessmentResult([]);
    setNextSteps("");
    setRecommendation("");
    setDoctorPersonalNote("");
    setOtherNotes("");
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
          value={templateName}
          onChangeValue={(text) => setTemplateName(text)}
          containerStyle={styles.textInputColor}
        />
        {/* 2 */}
        <Text style={styles.title}>Patient Issue (Subjective)</Text>
        <CustomTextInput
          multiline={true}
          value={patientIssueSubjective}
          onChangeValue={(text) => setPatientIssueSubjective(text)}
          containerStyle={styles.textInputColor}
        />
        {/*3 */}
        <Text style={styles.title}>Patient Issue (Objective)</Text>
        <CustomTextInput
          multiline={true}
          value={patientIssueObjective}
          onChangeValue={(text) => setPatientIssueObjective(text)}
          containerStyle={styles.textInputColor}
        />

        {/*4 */}
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
              marginLeft: 22,
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

        {/* 5 */}
        <Text style={[styles.title, { marginTop: verticalScale(25) }]}>
          Next steps
        </Text>
        <CustomTextInput
          multiline={true}
          value={nextSteps}
          onChangeValue={(text) => setNextSteps(text)}
          containerStyle={styles.textInputColor}
        />
        {/* 6 */}
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
                ? item.medicalTreatment
                : selectedItems.map((index) => medicalTreatmentList[index])
            }
            renderItem={({ item, index }) => selectedMedicalItems(item, index)}
            keyExtractor={(item, index) => index.toString()}
          />

          <Text style={styles.totalText}>
            Total: Rp{" "}
            {item
              ? item.medicalTreatment && selectedItems.length === 0
                ? calculateTotalPriceEdit()
                : calculateTotalPrice()
              : calculateTotalPrice()}
          </Text>
        </View>

        {/* 8 */}
        <Text style={[styles.title, { marginTop: verticalScale(25) }]}>
          Recommendations & Restrictions
        </Text>
        <CustomTextInput
          multiline={true}
          value={recommendation}
          onChangeValue={(text) => setRecommendation(text)}
          containerStyle={styles.textInputColor}
        />
        {/*9 */}
        <Text style={styles.title}>Other Notes (Shared with Patient)</Text>
        <CustomTextInput
          multiline={true}
          value={otherNotes}
          onChangeValue={(text) => setOtherNotes(text)}
          containerStyle={styles.textInputColor}
        />
        {/* 10*/}
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
        <Modal isVisible={openModal}>
          <View style={styles.modalStyle}>
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
                    <View
                      key={`MedicalTreatmentList-${index}`}
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
              </>
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

  return (
    <GestureHandlerRootView style={styles.container}>
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
            disabled={templateName === "" ? true : false}
            containerStyle={{
              width: moderateScale(165),
              opacity: templateName === "" ? 0.5 : 1,
            }}
            onPress={item ? handleUpdate : addExaminationTemplate}
            label={item ? "Update" : "Add"}
            loading={loading}
          />
        </View>
        {openModal && renderModal()}
        {openModalAssessmentResult && renderModalAssessmentResult()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ExaminationTemplate;
