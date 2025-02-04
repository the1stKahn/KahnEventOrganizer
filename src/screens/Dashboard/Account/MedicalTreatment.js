import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { scale, verticalScale } from "../../../styles/responsiveSize";
import { CustomButton, CustomTextInput } from "../../../components";
import Modal from "react-native-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import imagePath from "../../../constants/imagePath";
import { auth, db } from "../../../database/firebase";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import utils from "../../../utils/utils";

const MedicalTreatment = ({ navigation }) => {
  const [openModal, setOpenModal] = useState(false);
  const [medicalTreatment, setMedicalTreatment] = useState("");
  const [medicalTreatmentList, setMedicalTreatmentList] = useState([]);
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [itemIndex, setItemIndex] = useState(0);
  const [key, setKey] = useState("");
  const [pricePerUnitError, setPricePerUnitError] = useState("");

  useEffect(() => {
    getMedicalTreatment();
  }, []);

  // Handler
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

  const addMedicalTreatment = async () => {
    setLoading(true);
    const user = auth.currentUser;

    if (user) {
      try {
        const medicalTreatmentInfo = {
          medicalTreatment,
          pricePerUnit,
        };
        const medicalTreatmentRef = doc(db, "users", user.uid);
        await updateDoc(medicalTreatmentRef, {
          medicalTreatmentInfo: arrayUnion(medicalTreatmentInfo),
        });

        setLoading(false);
        Alert.alert("Medical treatment added successfully");
        setOpenModal(false);
        setMedicalTreatment("");
        setPricePerUnit("");
        getMedicalTreatment();
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const medicalTreatmentTemplate = docSnap.exists()
          ? docSnap.data().medicalTreatmentInfo
          : [];
        if (itemIndex >= 0 && itemIndex < medicalTreatmentTemplate.length) {
          const updatedItem = {
            ...medicalTreatmentTemplate[itemIndex],
            medicalTreatment,
            pricePerUnit,
          };
          medicalTreatmentTemplate[itemIndex] = updatedItem;
          await updateDoc(docRef, {
            medicalTreatmentInfo: medicalTreatmentTemplate,
          });
          setLoading(false);
          Alert.alert("Medical Treatment updated successfully");
          setOpenModal(false);
          setMedicalTreatment("");
          setPricePerUnit("");
          setKey("");
          getMedicalTreatment();
        }
      }
    } catch (error) {
      console.error("Error updating prescription template:", error);
    }
  };

  const deleteMedicalTreatmentTemplate = async (index) => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const medicalTreatmentTemplate = data.medicalTreatmentInfo || [];
          if (index >= 0 && index < medicalTreatmentTemplate.length) {
            medicalTreatmentTemplate.splice(index, 1);
            await updateDoc(docRef, {
              medicalTreatmentInfo: medicalTreatmentTemplate,
            });
          }
          setMedicalTreatmentList(medicalTreatmentTemplate);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  // Render

  function isEnable() {
    return (
      medicalTreatment !== "" && pricePerUnit !== "" && pricePerUnitError === ""
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
          <Text style={styles.profileTextStyle}>Medical Treatment</Text>
        </View>
      </View>
    );
  }

  function onRefresh() {
    setRefreshing(true);
    getMedicalTreatment();
    setRefreshing(false);
  }

  function renderMedicalTreatmentList() {
    return (
      <>
        {loading ? (
          <ActivityIndicator size="small" color={colors.secondary} />
        ) : medicalTreatmentList === undefined ||
          medicalTreatmentList.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Image source={imagePath.icNoData} style={styles.noDataImage} />
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
                key={`MedicalTreatmentListtt-${index}`}
                style={[
                  styles.medicalTreatmentList,
                  { paddingHorizontal: scale(16), flexDirection: "row" },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.medicalTreatmentListText}>
                    {item.medicalTreatment} - Rp {item.pricePerUnit}
                  </Text>
                </View>

                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => {
                      setOpenModal(true),
                        setMedicalTreatment(item.medicalTreatment),
                        setPricePerUnit(item.pricePerUnit);
                      setKey("editMedicalTreatment");
                      setItemIndex(index);
                    }}
                    style={{ marginRight: scale(10) }}
                  >
                    <Image
                      resizeMode="contain"
                      source={imagePath.icEditIcon}
                      style={styles.editIconImage}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteMedicalTreatmentTemplate(index)}
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
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            keyExtractor={(item) => item.id}
          />
        )}
      </>
    );
  }

  function renderModal() {
    return (
      <View>
        <Modal
          onBackdropPress={() => {
            setOpenModal(false), setMedicalTreatment(""), setPricePerUnit("");
          }}
          isVisible={openModal}
        >
          <KeyboardAwareScrollView
            contentContainerStyle={styles.keyBoardAwareStyle}
          >
            <View style={styles.container1}>
              <Text style={styles.heading}>Medical Treatment</Text>
              <CustomTextInput
                multiline={true}
                value={medicalTreatment}
                onChangeValue={(text) => setMedicalTreatment(text)}
                containerStyle={styles.textInputContainer}
              />
            </View>

            <View style={styles.container1}>
              <Text style={styles.heading}>Price (per unit)</Text>
              <CustomTextInput
                keyboardType={"numeric"}
                value={pricePerUnit}
                onChangeValue={(text) => {
                  utils.validatePricePerUnit(text, setPricePerUnitError);
                  setPricePerUnit(text);
                }}
                errorMsg={pricePerUnitError}
                containerStyle={styles.textInputContainer}
              />
            </View>
            <CustomButton
              disabled={!isEnable()}
              onPress={
                key === "editMedicalTreatment"
                  ? handleUpdate
                  : addMedicalTreatment
              }
              loading={loading}
              containerStyle={{
                marginTop: verticalScale(10),
                opacity: isEnable() ? 1 : 0.5,
              }}
              label={key === "editMedicalTreatment" ? "Update" : "Add"}
            />

            <CustomButton
              onPress={() => {
                setOpenModal(false),
                  setMedicalTreatment(""),
                  setPricePerUnit("");
              }}
              containerStyle={styles.cancelButton}
              label="Cancel"
              labelStyle={styles.cancelButtonLabel}
            />
          </KeyboardAwareScrollView>
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
      {renderHeader()}
      {renderMedicalTreatmentList()}
      {openModal && renderModal()}
      <CustomButton
        onPress={() => setOpenModal(true)}
        label="Create New Medical Treatment"
        containerStyle={{
          marginTop: verticalScale(10),
          marginBottom: verticalScale(40),
        }}
      />
    </SafeAreaView>
  );
};

export default MedicalTreatment;
