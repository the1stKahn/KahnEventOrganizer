import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useState } from "react";
import styles from "./styles";
import imagePath from "../../../constants/imagePath";
import {
  CustomButton,
  TemplateNames,
  TemplateOptions,
} from "../../../components";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../../../styles/responsiveSize";
import Modal from "react-native-modal";
import navigationStrings from "../../../constants/navigationStrings";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import { useFocusEffect } from "@react-navigation/native";

const Templates = ({ navigation }) => {
  const [openModal, setOpenModal] = useState(false);
  const [examinationTemplateList, setExaminationTemplateList] = useState([]);
  const [prescriptionTemplateList, setPrescriptionTemplateList] = useState([]);
  const [treatmentTemplateList, setTreatmentTemplateList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examination, setExamination] = useState(false);
  const [prescription, setPrescription] = useState(false);
  const [treatment, setTreatment] = useState(false);

  React.useEffect(() => {
    getTemplates();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getTemplates();
    }, [])
  );

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
          setExaminationTemplateList(data.examinationTemplate);
          setPrescriptionTemplateList(data.prescriptionTemplate);
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

  // Deleting Data from Firebase

  const deleteExaminationTemplate = async (index) => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const examinationTemplate = data.examinationTemplate || [];
          if (index >= 0 && index < examinationTemplate.length) {
            examinationTemplate.splice(index, 1);
            await updateDoc(docRef, {
              examinationTemplate: examinationTemplate,
            });
          }
          setExaminationTemplateList(examinationTemplate);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const deletePrescriptionTemplate = async (index) => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const prescriptionTemplate = data.prescriptionTemplate || [];
          if (index >= 0 && index < prescriptionTemplate.length) {
            prescriptionTemplate.splice(index, 1);
            await updateDoc(docRef, {
              prescriptionTemplate: prescriptionTemplate,
            });
          }
          setPrescriptionTemplateList(prescriptionTemplate);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const deleteTreatmentTemplate = async (index) => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const treatmentTemplate = data.treatmentTemplate || [];
          if (index >= 0 && index < treatmentTemplate.length) {
            treatmentTemplate.splice(index, 1);
            await updateDoc(docRef, {
              treatmentTemplate: treatmentTemplate,
            });
          }
          setTreatmentTemplateList(treatmentTemplate);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Calling Modals
  function renderModal() {
    return (
      <View>
        <Modal
          onBackdropPress={() => setOpenModal(false)}
          isVisible={openModal}
        >
          <View style={styles.modalStyle}>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              {/* Examination Template */}
              <TemplateOptions
                onPress={() => {
                  navigation.navigate(navigationStrings.EXAMINATION_TEMPLATE, {
                    key: "template",
                    item: "",
                  }),
                    setOpenModal(false);
                }}
                icon={imagePath.icDentalMachine}
                label="Examination Template"
              />

              {/* Prescriptions Template */}
              <TemplateOptions
                onPress={() => {
                  navigation.navigate(navigationStrings.PRESCRIPTION_TEMPLATE, {
                    item: "",
                  }),
                    setOpenModal(false);
                }}
                icon={imagePath.icReceipt}
                label="Perscription Template"
                containerStyle={{ marginLeft: scale(10) }}
              />
            </View>
            <TemplateOptions
              onPress={() => {
                navigation.navigate(navigationStrings.TREATMENT_PLAN_TEMPLATE, {
                  iten: "",
                }),
                  setOpenModal(false);
              }}
              icon={imagePath.icWhatIDo}
              label="Treatment Template"
              containerStyle={{ marginTop: verticalScale(10) }}
            />
          </View>
        </Modal>
      </View>
    );
  }

  // Helper Renderers
  function renderExaminationTemplateList() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExamination(false)}
        style={styles.templateTitle2}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles.heading,
              {
                paddingTop: moderateScale(10),
              },
            ]}
          >
            Examination Templates
          </Text>

          <Image
            resizeMode="contain"
            source={imagePath.icUpArrow}
            style={styles.arrowStyle}
          />
        </View>
        <>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : examinationTemplateList === undefined ||
            examinationTemplateList.length === 0 ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No setup found. Please create one first
            </Text>
          ) : (
            examinationTemplateList.map((item, index) => {
              return (
                <View
                  key={`ExaminationTemplateList-${index}`}
                  style={[
                    styles.medicalTreatmentList,
                    {
                      paddingVertical: verticalScale(10),
                    },
                  ]}
                >
                  <Text style={styles.medicalTreatmentListText}>
                    {item.templateName}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={{ marginRight: scale(15) }}
                      onPress={() =>
                        navigation.navigate(
                          navigationStrings.EXAMINATION_TEMPLATE,
                          {
                            item: item,
                            itemIndex: index,
                          }
                        )
                      }
                    >
                      <Image
                        resizeMode="contain"
                        source={imagePath.icEditIcon}
                        style={styles.editIconImage}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteExaminationTemplate(index)}
                    >
                      <Image
                        resizeMode="contain"
                        source={imagePath.icDelete}
                        style={styles.editIconImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </>
      </TouchableOpacity>
    );
  }

  function renderPrescriptionTemplateList() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setPrescription(false)}
        style={styles.templateTitle2}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles.heading,
              {
                paddingTop: moderateScale(10),
              },
            ]}
          >
            Prescription Templates
          </Text>

          <Image
            resizeMode="contain"
            source={imagePath.icUpArrow}
            style={styles.arrowStyle}
          />
        </View>
        <>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : prescriptionTemplateList === undefined ||
            prescriptionTemplateList.length === 0 ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No setup found. Please create one first
            </Text>
          ) : (
            prescriptionTemplateList.map((item, index) => {
              return (
                <View
                  key={`PrescriptionTemplateList-${index}`}
                  style={[
                    styles.medicalTreatmentList,
                    {
                      paddingVertical: verticalScale(10),
                    },
                  ]}
                >
                  <Text style={styles.medicalTreatmentListText}>
                    {item.prescriptionTemplateName}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={{ marginRight: scale(15) }}
                      onPress={() =>
                        navigation.navigate(
                          navigationStrings.PRESCRIPTION_TEMPLATE,
                          {
                            item: item,
                            itemIndex: index,
                          }
                        )
                      }
                    >
                      <Image
                        resizeMode="contain"
                        source={imagePath.icEditIcon}
                        style={styles.editIconImage}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deletePrescriptionTemplate(index)}
                    >
                      <Image
                        resizeMode="contain"
                        source={imagePath.icDelete}
                        style={styles.editIconImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </>
      </TouchableOpacity>
    );
  }

  function renderTreatmentTemplateList() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setTreatment(false)}
        style={styles.templateTitle2}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles.heading,
              {
                paddingTop: moderateScale(10),
              },
            ]}
          >
            Treatment Plan Templates
          </Text>

          <Image
            resizeMode="contain"
            source={imagePath.icUpArrow}
            style={styles.arrowStyle}
          />
        </View>
        <>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : treatmentTemplateList === undefined ||
            treatmentTemplateList.length === 0 ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No setup found. Please create one first.
            </Text>
          ) : (
            treatmentTemplateList.map((item, index) => {
              return (
                <View
                  key={`TreatmentTemplateList-${index}`}
                  style={[
                    styles.medicalTreatmentList,
                    {
                      paddingVertical: verticalScale(10),
                    },
                  ]}
                >
                  <Text style={styles.medicalTreatmentListText}>
                    {item.treatmentTemplateName}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={{ marginRight: scale(15) }}
                      onPress={() =>
                        navigation.navigate(
                          navigationStrings.TREATMENT_PLAN_TEMPLATE,
                          {
                            item: item,
                            itemIndex: index,
                          }
                        )
                      }
                    >
                      <Image
                        resizeMode="contain"
                        source={imagePath.icEditIcon}
                        style={styles.editIconImage}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTreatmentTemplate(index)}
                    >
                      <Image
                        resizeMode="contain"
                        source={imagePath.icDelete}
                        style={styles.editIconImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </>
      </TouchableOpacity>
    );
  }

  function renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flex: 1 }}
        >
          <Image source={imagePath.icArrowLeft} style={styles.arrowStyle2} />
        </TouchableOpacity>
        <View style={{ flex: 1.5 }}>
          <Text style={styles.profileTextStyle}>Template</Text>
        </View>
      </View>
    );
  }

  function renderTemplateList() {
    return (
      <>
        {examination ? (
          renderExaminationTemplateList()
        ) : (
          <TemplateNames
            label="Examination Templates"
            onPress={() => setExamination(true)}
          />
        )}

        {prescription ? (
          renderPrescriptionTemplateList()
        ) : (
          <TemplateNames
            label="Perscription Templates"
            onPress={() => setPrescription(true)}
          />
        )}
        {treatment ? (
          renderTreatmentTemplateList()
        ) : (
          <TemplateNames
            label="Treatment Plan Templates"
            onPress={() => setTreatment(true)}
          />
        )}
      </>
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
      {renderHeader()}
      {renderTemplateList()}
      <CustomButton
        containerStyle={{
          marginTop: verticalScale(40),
          marginBottom: verticalScale(40),
        }}
        onPress={() => setOpenModal(true)}
        label="Create New Template"
      />
      {openModal && renderModal()}
    </SafeAreaView>
  );
};

export default Templates;
