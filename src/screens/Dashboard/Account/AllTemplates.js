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
import { TemplateNames } from "../../../components";
import { moderateScale, verticalScale } from "../../../styles/responsiveSize";
import navigationStrings from "../../../constants/navigationStrings";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import { useFocusEffect } from "@react-navigation/native";

const AllTemplates = ({ navigation }) => {
  const [examinationTemplateList, setExaminationTemplateList] = useState([]);
  const [prescriptionTemplateList, setPrescriptionTemplateList] = useState([]);
  const [treatmentTemplateList, setTreatmentTemplateList] = useState([]);
  const [medicalTreatmentList, setMedicalTreatmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examination, setExamination] = useState(false);
  const [prescription, setPrescription] = useState(false);
  const [treatment, setTreatment] = useState(false);
  const [medicalTreatment, setMedicalTreatment] = useState(false);

  React.useEffect(() => {
    getTemplates();
    getMedicalTreatment();
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
          console.log(data.medicalTreatmentInfo);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Helper Renderers
  function renderExaminationTemplateList() {
    return (
      <View style={styles.templateTitle2}>
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
          <TouchableOpacity onPress={() => setExamination(false)}>
            <Image
              resizeMode="contain"
              source={imagePath.icUpArrow}
              style={styles.arrowStyle}
            />
          </TouchableOpacity>
        </View>
        <>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : examinationTemplateList === undefined ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No setup found. Please create one first.
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
                  <TouchableOpacity
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
                </View>
              );
            })
          )}
        </>
      </View>
    );
  }

  function renderPrescriptionTemplateList() {
    return (
      <View style={styles.templateTitle2}>
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
          <TouchableOpacity onPress={() => setPrescription(false)}>
            <Image
              resizeMode="contain"
              source={imagePath.icUpArrow}
              style={styles.arrowStyle}
            />
          </TouchableOpacity>
        </View>
        <>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : prescriptionTemplateList === undefined ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No setup found. Please create one first.
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
                  <TouchableOpacity
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
                </View>
              );
            })
          )}
        </>
      </View>
    );
  }

  function renderTreatmentTemplateList() {
    return (
      <View style={styles.templateTitle2}>
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
          <TouchableOpacity onPress={() => setTreatment(false)}>
            <Image
              resizeMode="contain"
              source={imagePath.icUpArrow}
              style={styles.arrowStyle}
            />
          </TouchableOpacity>
        </View>
        <>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : treatmentTemplateList === undefined ? (
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
                  <TouchableOpacity
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
                </View>
              );
            })
          )}
        </>
      </View>
    );
  }

  function renderMedicalTreatmentList() {
    return (
      <View style={styles.templateTitle2}>
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
            Medical Treatment Templates
          </Text>
          <TouchableOpacity onPress={() => setMedicalTreatment(false)}>
            <Image
              resizeMode="contain"
              source={imagePath.icUpArrow}
              style={styles.arrowStyle}
            />
          </TouchableOpacity>
        </View>
        <>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : medicalTreatmentList === undefined ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No setup found. Please create one first.
            </Text>
          ) : (
            medicalTreatmentList.map((item, index) => {
              return (
                <View
                  key={`MedicalTreatmentListTemplate-${index}`}
                  style={[
                    styles.medicalTreatmentList,
                    {
                      paddingVertical: verticalScale(10),
                    },
                  ]}
                >
                  <Text style={styles.medicalTreatmentListText}>
                    {item.medicalTreatment} - Rp {item.pricePerUnit}
                  </Text>
                </View>
              );
            })
          )}
        </>
      </View>
    );
  }

  // Main Renderers

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
            label="Prescription Templates"
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
        {medicalTreatment ? (
          renderMedicalTreatmentList()
        ) : (
          <TemplateNames
            label="Medical Treatment Templates"
            onPress={() => setMedicalTreatment(true)}
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
    </SafeAreaView>
  );
};

export default AllTemplates;
