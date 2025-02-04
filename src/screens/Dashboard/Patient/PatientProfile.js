import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Linking,
  ActivityIndicator,
  Alert,
  Modal as ModalPreview,
  Platform,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import styles from "./styles";
import imagePath from "../../../constants/imagePath";
import colors from "../../../styles/colors";
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
} from "../../../styles/responsiveSize";
import {
  CustomButton,
  CustomTextInput,
  MedicalHistoryPatient,
  Options,
  PatientInformation,
  TemplateNames,
  TemplateOptions,
} from "../../../components";
import Modal from "react-native-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import navigationStrings from "../../../constants/navigationStrings";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

const PatientProfile = ({ navigation, route }) => {
  const { item, itemIndex } = route?.params;
  const [information, setInformation] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loadingExamination, setLoadingExamination] = useState(false);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const [datePicker1, setDatePicker1] = useState(false);
  const [datePicker2, setDatePicker2] = useState(false);
  const [examination, setExamination] = useState(false);
  const [prescription, setPrescription] = useState(false);
  const [treatment, setTreatment] = useState(false);
  const [dateRange, setDateRange] = useState(false);
  const [loadingExaminationDelete, setLoadingExaminationDelete] =
    useState(false);
  const [creatingReport, setCreatingReport] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataOfExaminationPatients, setDataOfExaminationPatients] = useState(
    []
  );
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [dataOfPrescriptionPatients, setDataOfPrescriptionPatients] = useState(
    []
  );
  const [dataOfTreatmentPatients, setDataOfTreatmentPatients] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [doctorInfo, setDoctorInfo] = useState([]);
  const [key, setKey] = useState("");
  const [isModalPreview, SetIsModalPreview] = useState(false);

  useEffect(() => {
    getExaminationData();
    getPrescriptionData();
    getTreatment();
    getDoctorInfo();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getExaminationData();
      getPrescriptionData();
      getTreatment();
    }, [])
  );

  const originalDate = date1.toDateString();
  const parsedDate = new Date(originalDate);
  const formattedDate = `${getFormattedDate(parsedDate)}`;

  const originalDate2 = date2.toDateString();
  const parsedDate2 = new Date(originalDate2);
  const formattedDate2 = `${getFormattedDate(parsedDate2)}`;

  // Getting data from firestore

  const getExaminationData = async () => {
    setLoadingExamination(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDataOfExaminationPatients(data.patients[itemIndex].examination);
          setLoadingExamination(false);
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

  const getPrescriptionData = async () => {
    setLoadingPrescription(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDataOfPrescriptionPatients(data.patients[itemIndex].prescription);
          setLoadingPrescription(false);
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

  const getTreatment = async () => {
    setLoadingTreatment(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDataOfTreatmentPatients(data.patients[itemIndex].treatment);
          setLoadingTreatment(false);
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

  const getDoctorInfo = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDoctorInfo(data.doctorInfo);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Deleting data from firestore

  const handleDeleteExamination = async (_id) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const patients = data.patients;
          const examination = patients[itemIndex].examination;
          const updatedExamination = examination.filter(
            (exam) => exam._id !== _id
          );

          patients[itemIndex].examination = updatedExamination;

          await updateDoc(docRef, { patients });
          setDataOfExaminationPatients(updatedExamination);
          Alert.alert("Deleted successfully");
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

  const handleDeletePrescription = async (_id) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const patients = data.patients;
          const prescription = patients[itemIndex].prescription;
          const updatedPrescription = prescription.filter(
            (pres) => pres._id !== _id
          );

          patients[itemIndex].prescription = updatedPrescription;

          await updateDoc(docRef, { patients });
          setDataOfPrescriptionPatients(updatedPrescription);
          Alert.alert("Deleted successfully");
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

  const handleDeleteTreatment = async (_id) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const patients = data.patients;
          const treatment = patients[itemIndex].treatment;
          const updatedTreatment = treatment.filter(
            (treat) => treat._id !== _id
          );

          patients[itemIndex].treatment = updatedTreatment;

          await updateDoc(docRef, { patients });
          setDataOfTreatmentPatients(updatedTreatment);
          Alert.alert("Deleted successfully");
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

  // Sharing data

  const handleShareExamination = async (item) => {
    setIsModalVisible(false);
    try {
      if (!item) {
        Alert.alert("No Data");
        return;
      }

      const currentDate = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const doctorDetails = `
        <div style="margin: 20px 0; padding: 3px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="font-size: 18px; font-weight: bold;">${doctorInfo.doctorName}</p>
              <p>${doctorInfo.phoneNumber}</p>
              <p>${doctorInfo.homeAddress}</p>
            </div>
            <div>
              <p>${currentDate}</p>
            </div>
          </div>
          <hr style="border: 1px solid black; margin-top: 10px;">
        </div>
      `;

      const examinationHeader = `
        <h2 style="text-align: center; font-weight: bold; font-size: 20px;">Laporan Pemeriksaan</h2>
        <p style="font-size: 18px; margin: 5px 0;"><strong>Pasien:</strong> ${item.patientName}</p>
        <p style="font-size: 18px;"><strong>Tanggal Lahir:</strong> ${item.patientDob} - <strong>Jenis Kelamin:</strong> <span>${item.sex}</span></p>
        <p style="font-size: 18px;"><strong>Alamat:</strong> ${item.address}
        <hr style="border: 1px solid black; margin-top: 10px;">`;

      const examinationInformation = `
        <p><strong>Tanggal Pemeriksaan:</strong> ${item.examinationDate}</p>
        <p><strong>Anamnesis:</strong> ${item.patientIssueSubjective}</p>
        <p><strong>Diagnosa:</strong> ${item.patientIssueObjective}</p>
        <p><strong>Tindakan:</strong> ${item.assessmentResult}</p>
        <p><strong>Selanjutnya:</strong> ${item.nextSteps}</p>
      `;

      const medicalTreatmentTable = `
        <h2 style="font-weight: bold; font-size: 18px; margin-top: 20px;">Tindakan Medis:</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <colgroup>
            <col style="width: 70%;">
            <col style="width: 30%;">
          </colgroup>
          <tr>
            <th style="border: 1px solid black; padding: 5px;">Nama Tindakan</th>
            <th style="border: 1px solid black; padding: 5px;">Harga per unit</th>
          </tr>
          ${item.medicalTreatment
            .map(
              (treatment) => `
            <tr>
              <td style="border: 1px solid black; padding: 5px;">${treatment.medicalTreatment}</td>
              <td style="border: 1px solid black; padding: 5px;">${treatment.pricePerUnit}</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td style="border: 1px solid black; padding: 5px; font-weight: bold; text-align: right;">Total</td>
            <td style="border: 1px solid black; padding: 5px;">${calculateTotal(
              item.medicalTreatment
            )}</td>
          </tr>
        </table>
      `;

      const additionalFields = `
        <p><strong>Metode Pembayaran:</strong> ${item.paymentMethod}</p>
        <p><strong>Larangan dan Anjuran:</strong> ${item.recommendation}</p>
        <p><strong>Catatan Dokter:</strong> ${item.otherNote}</p>
      `;

      const photos = `
        <h2 style="font-weight: bold; font-size: 18px; margin-top: 20px;">Foto:</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            ${item.examinationImages
              .map(
                (image, index) => `
                  <td style="padding: 5px;">
                    <img src="${image}" style="max-width: 100%; height: auto;" alt="Photo ${
                  index + 1
                }">
                  </td>
                  ${index % 2 === 1 ? "</tr><tr>" : ""}
                `
              )
              .join("")}
          </tr>
        </table>
      `;

      const disclaimer = `
        <p style="text-align: center; font-size: 12px; position: absolute; bottom: 0; width: 100%;">
          Laporan Pemeriksaan dibuat oleh Perigigi.com, Super App Dokter Gigi Indonesia
        </p>
      `;

      // Combine all HTML sections
      const htmlContent = `
        ${doctorDetails}
        ${examinationHeader}
        ${examinationInformation}
        ${medicalTreatmentTable}
        ${additionalFields}
        ${photos}
        ${disclaimer}
      `;

      // Create a file path
      const filePath = `${FileSystem.documentDirectory}${item.patientName}_examination.html`;

      // Write HTML content to file
      await FileSystem.writeAsStringAsync(filePath, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file using expo-sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
        Alert.alert("Report shared successfully.");
      } else {
        Alert.alert("Sharing is not available on this platform.");
      }
    } catch (error) {
      console.error("Error creating and sharing file:", error);
      Alert.alert("Error", "Something went wrong while sharing the file.");
    }

    function calculateTotal(medicalTreatments) {
      return medicalTreatments.reduce(
        (total, treatment) => total + parseInt(treatment.pricePerUnit, 10),
        0
      );
    }
  };

  const handleSharePrescription = async (item) => {
    setIsModalVisible(false);
    try {
      if (!item) {
        Alert.alert("No Data");
        return;
      }

      const doctorDetails = `
        <div style="text-align: center;">
          <p style="font-size: 14px; margin: 3px 0; color: #000; min-height: 25px;"></p>
          <p style="font-size: 16px; margin: 3px 0;"><strong>${doctorInfo.doctorName}</strong></p>
          <p style="font-size: 14px; margin: 3px 0; color: #000; font-weight:bold;">${doctorInfo.sip}</p>
          <p style="font-size: 12px; margin: 3px 0; color: #000;">${doctorInfo.homeAddress}, Phone: ${doctorInfo.phoneNumber}</p>
          <hr style="border: 1px solid black; margin: 5px 0;">
        </div>`;

      const prescriptionInfo = `
        <p style="font-size: 12px; margin: 3px 0; color: #000;">${item.examinationDate}</p>
        <p style="font-size: 14px; margin: 3px 0; color: #000;"><strong>Pasien:</strong> ${item.patientName}</p>
        <p style="font-size: 14px; margin: 3px 0; color: #000;"><strong>Tanggal lahir:</strong> ${item.dateOfBirth}</p>
        <p style="font-size: 14px; margin: 3px 0; color: #000;"><strong>Jenis Kelamin:</strong> ${item.sex}</p>
        <p style="font-weight: bold; font-size: 14px; margin: 3px 0;">R/:</p>`;

      const medicationList = item.medicationList
        .map(
          (medication, index) => `
            <p style="font-size: 14px; margin: 3px 0;color: #000;">${
              index + 1
            }: ${medication.findMedication}, ${medication.quantity}, ${
            medication.instructions
          }</p>`
        )
        .join("");

      const disclaimer = `
        <footer>  
          <p style="text-align: center; font-size: 10px; color: #000;">
            Resep ini dibuat dan ditandatangani secara digital oleh ${doctorInfo.doctorName} Menggunakan Perigigi.com – Super App Dokter Gigi Indonesia.
          </p>
        </footer>`;

      // Combine all HTML sections
      const htmlContent = `
        <html>
          <head>
            <style type="text/css" media="print">
              @page { size: auto; margin: 0mm; }
              html { background-color: #FFFFFF; margin: 0px; }
              body { margin: 0mm; }
            </style>
          </head>
          <body>
            <div style="min-height: 100vh; display: flex; flex-direction: column;">
              ${doctorDetails}
              <div style="margin: 5mm; margin-top: 0mm;">
                ${prescriptionInfo}
                <div style="font-size: 14px; margin: 3px 10px;">
                  ${medicationList}
                </div>
              </div>
              <div style="position: absolute; bottom: 0px; margin: 5mm;">
                ${disclaimer}
              </div>
            </div>
          </body>
        </html>`;

      // Create a file path
      const filePath = `${FileSystem.documentDirectory}${item.patientName}_prescription.html`;

      // Write HTML content to file
      await FileSystem.writeAsStringAsync(filePath, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file using expo-sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
        Alert.alert("Prescription shared successfully.");
      } else {
        Alert.alert("Sharing is not available on this platform.");
      }
    } catch (error) {
      console.error("Error creating and sharing prescription:", error);
      Alert.alert(
        "Error",
        "Something went wrong while sharing the prescription."
      );
    }
  };

  const handleShareTreatment = async (item) => {
    setIsModalVisible(false);
    try {
      if (!item) {
        Alert.alert("No Data");
        return;
      }

      const currentDate = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const doctorDetails = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <p style="font-size: 18px;">${doctorInfo.doctorName}</p>
                <p>${doctorInfo.phoneNumber}</p>
                <p>${doctorInfo.homeAddress}</p>
            </div>
            <div>
                <p>${currentDate}</p>
            </div>
        </div>
        <hr style="border: 1px solid black; margin-top: 20px;">`;

      const treatmentHeader = `
        <h2 style="text-align: center; font-size: 20px;">Rencana Perawatan Gigi</h2>
        <p style="font-size: 18px; margin: 5px 0;"><strong>Pasien:</strong> ${item.patientName}</p>
        <p style="font-size: 18px;"><strong>Tanggal Lahir:</strong> ${item.patientDob} - <strong>Jenis Kelamin:</strong> <span>${item.sex}</span></p>
        <p style="font-size: 18px;"><strong>Alamat:</strong> ${item.address}
        <hr style="border: 1px solid black; margin-top: 20px;">`;

      const treatmentPlan = `
        <p style="font-size: 18px; margin: 5px 0;"><strong>Tanggal Konsultasi:</strong> ${item.examinationDate}</p>
        <p style="font-size: 18px; margin: 5px 0;"><strong>Tujuan:</strong> ${item.nextSteps}</p>
        <p style="font-size: 18px; margin: 5px 0;"><strong>Rekomendasi dan Larangan Selama Perawatan:</strong> ${item.recommendation}</p>
        `;

      const treatmentTableRows = item.medicalTreatment
        .map(
          (treatment, index) => `
            <tr style="border: 1px solid black;">
                <td style="text-align: center; font-size: 18px; padding: 5px;">${
                  index + 1
                }</td>
                <td style="border: 1px solid black; padding: 5px;">${
                  treatment.medicalTreatment
                }</td>
                <td style="text-align: center; font-size: 18px; padding: 5px;">${parseInt(
                  treatment.pricePerUnit
                )}</td>
            </tr>
        `
        )
        .join("");

      const totalPrice = item.medicalTreatment.reduce(
        (total, treatment) => total + parseInt(treatment.pricePerUnit),
        0
      );

      const treatmentTable = `
      <table style="width: 70%; border-collapse: collapse; margin: 30px auto 0;">
          <colgroup>
              <col style="width: 10%;">
              <col style="width: 40%;">
              <col style="width: 20%;">
          </colgroup>
          <tr>
              <th style="border: 1px solid black; border-bottom: 2px solid black; padding: 5px;">No</th>
              <th style="border: 1px solid black; border-bottom: 2px solid black; padding: 5px;">Nama Tindakan</th>
              <th style="border: 1px solid black; border-bottom: 2px solid black; padding: 5px;">Harga</th>
          </tr>
          ${treatmentTableRows}
          <tr>
              <td colspan="2" style="text-align: right; font-size: 18px; border: 1px solid black; padding: 5px;"><strong>Total</strong></td>
              <td style="text-align: center; font-size: 18px; border: 1px solid black; padding: 5px;">${totalPrice}</td>
          </tr>
      </table>`;

      const treatmentFooter = `
        <div style="margin-top: 20px;">
          <p style="font-size: 18px; margin: 5px 0;"><strong>Catatan:</strong> ${item.otherNote}</p>
        </div>`;

      const disclaimer = `
        <p style="text-align: center; font-size: 12px; position: absolute; bottom: 0; width: 100%;">
        Rencana Perawatan Gigi dibuat oleh Perigigi.com, Super App Dokter Gigi Indonesia
        </p>`;

      // Generate the HTML content
      const htmlContent = `
        ${doctorDetails}
        ${treatmentHeader}
        ${treatmentPlan}
        ${treatmentTable}
        ${treatmentFooter}
        ${disclaimer}
      `;

      // Create a file path
      const filePath = `${FileSystem.documentDirectory}${item.patientName}_treatment.html`;

      // Write HTML content to file
      await FileSystem.writeAsStringAsync(filePath, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file using expo-sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
        Alert.alert("Report shared successfully.");
      } else {
        Alert.alert("Sharing is not available on this platform.");
      }
    } catch (error) {
      console.error("Error creating and sharing file:", error);
      Alert.alert("Error", "Something went wrong while sharing the file.");
    }
  };

  const deleteAlertExamination = (id) => {
    setIsModalVisible(false);
    Alert.alert("Delete", "Are you sure you want to delete this examination?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => handleDeleteExamination(id),
        style: "destructive",
      },
    ]);
  };

  const deleteAlertPrescription = (id) => {
    setIsModalVisible(false);
    Alert.alert("Delete", "Are you sure you want to delete this examination?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => handleDeletePrescription(id),
        style: "destructive",
      },
    ]);
  };

  const deleteAlertTreatment = (id) => {
    setIsModalVisible(false);
    Alert.alert("Delete", "Are you sure you want to delete this examination?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => handleDeleteTreatment(id),
        style: "destructive",
      },
    ]);
  };

  //  Handlers

  const initiateWhatsApp = (mobileNumber) => {
    let url =
      "whatsapp://send?text=" + "Hi There!" + "&phone=62" + mobileNumber;
    Linking.openURL(url)
      .then((data) => {
        console.log("WhatsApp Opened");
      })
      .catch(() => {
        alert("Make sure Whatsapp installed on your device");
      });
  };

  const onDateSelected1 = (event, value) => {
    setDate1(value);
    if (Platform.OS === "android") {
      setDatePicker1(false);
    }
  };

  const onDateSelected2 = (event, value) => {
    setDate2(value);
    if (Platform.OS === "android") {
      setDatePicker2(false);
    }
  };

  const parseDate = (dateString) => {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      // Month is 0-based in JavaScript, so subtract 1
      return new Date(year, month - 1, day);
    }
    return null; // Invalid date format
  };

  const handleFilterData = async () => {
    try {
      setCreatingReport(true);

      if (formattedDate && formattedDate2) {
        const startDate = parseDate(formattedDate);
        const endDate = parseDate(formattedDate2);
        const filtered = dataOfExaminationPatients.filter((item) => {
          const itemDate = parseDate(item.examinationDate);
          return itemDate >= startDate && itemDate <= endDate;
        });

        setFilteredData(filtered);

        if (!filtered || filtered.length === 0) {
          Alert.alert("No Data");
          setCreatingReport(false);
          return;
        }

        const currentDate = new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const doctorDetails = `
            <div style="margin: 20px 0; padding: 3px;">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <p style="font-size: 18px; font-weight: bold;">${doctorInfo.doctorName}</p>
                  <p>${doctorInfo.phoneNumber}</p>
                  <p>${doctorInfo.homeAddress}</p>
                </div>
                <div>
                  <p>${currentDate}</p>
                </div>
              </div>
              <hr style="border: 1px solid black; margin-top: 10px;">
            </div>
          `;

        const examinationHeader = `
          <h2 style="text-align: center; font-weight: bold; font-size: 20px;">Resume Medis</h2>
          <p style="font-size: 18px; margin: 5px 0;"><strong>Pasien:</strong> ${item.patientName}</p>
          <p style="font-size: 18px;"><strong>Tanggal Lahir:</strong> ${item.placeDateOfBirth} - <strong>Jenis Kelamin:</strong> <span>${item.sex}</span></p>
          <p style="font-size: 18px;"><strong>Alamat:</strong> ${item.homeAddress}
          <hr style="border: 1px solid black; margin-top: 10px;">`;

        // Map filtered data and generate content with item numbers and spacing
        const examinationContent = filtered
          .map(
            (item, index) => `
    <div style="margin-top: 10px;">
      <p>${index + 1}. Tanggal Pemeriksaan: ${item.examinationDate}</p>
      <div style="margin-left: 20px;">
        <p>Anamnesis: ${item.patientIssueSubjective}</p>
        <p>Diagnosa: ${item.patientIssueObjective}</p>
        <p>Tindakan: ${item.assessmentResult}</p>
        <p>Selanjutnya: ${item.nextSteps}</p>
      </div>
    </div>
  `
          )
          .join("");

        const disclaimer = `
          <p style="text-align: center; font-size: 12px; position: absolute; bottom: 0; width: 100%;">
          Resume Medis dibuat oleh Perigigi.com, Super App Dokter Gigi Indonesia
          </p>
        `;

        const options = {
          html: `
              ${doctorDetails}
              ${examinationHeader}
              ${examinationContent}
              ${disclaimer}
            `,
          fileName: "medical_report",
          directory: "Documents",
        };

        const file = await RNHTMLtoPDF.convert(options);
        const shareOptions = {
          url: `file://${file.filePath}`,
          type: "application/pdf",
        };
        setCreatingReport(false);
        await Share.open(shareOptions);
        Alert.alert("PDF Report Created");

        setDateRange(false);
      } else {
        Alert.alert("Dates not found or invalid");
      }
    } catch (error) {
      console.error("Error creating or sharing PDF:", error);
    }
  };

  const handleEditExamination = (item) => {
    navigation.navigate(navigationStrings.EXAMINATION, {
      item: item,
      patientIndex: itemIndex,
      key: "editExamination",
    });
    setIsModalVisible(false);
  };

  const handleEditPrescription = (item) => {
    navigation.navigate(navigationStrings.PRESCRIPTION, {
      item: item,
      patientIndex: itemIndex,
      key: "editPrescription",
    });
    setIsModalVisible(false);
  };

  const handleEditTreatment = (item) => {
    navigation.navigate(navigationStrings.TREATMENT_PLAN, {
      item: item,
      patientIndex: itemIndex,
      key: "editTreatment",
    });
    setIsModalVisible(false);
  };

  // Renderers

  function showDatePicker1() {
    setDatePicker1(true);
    setDatePicker2(false);
  }

  function showDatePicker2() {
    setDatePicker1(false);
    setDatePicker2(true);
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
          <Text style={styles.profileTextStyle}>Patient Profile</Text>
        </View>
        <TouchableOpacity
          onPress={
            medicalHistory
              ? () => setOpenModal(true)
              : () =>
                  navigation.navigate(navigationStrings.EDIT_PATIENT_PROFILE, {
                    item: item,
                    patientIndex: itemIndex,
                  })
          }
          activeOpacity={0.8}
        >
          {medicalHistory ? (
            <Image
              tintColor={colors.black}
              source={imagePath.icAddRecord}
              style={styles.editInfo}
            />
          ) : (
            <Image
              tintColor={colors.black}
              source={imagePath.icEditInfo}
              style={styles.editInfo}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  function renderProfileImage() {
    return (
      <View style={styles.profileImageContainer2}>
        <Image
          source={{ uri: item?.imageUrl }}
          style={styles.profileimageStyle}
        />
      </View>
    );
  }

  function renderNameOfPatient() {
    return (
      <View style={styles.containerOfName}>
        <Text style={styles.inputName2}>{item?.patientName}</Text>
      </View>
    );
  }

  function renderWhatsapp() {
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => initiateWhatsApp(item?.phoneNumber)}
          // onPress={() =>
          //   handleOpenWhatsApp(item?.phoneNumber, item?.patientName)
          // }
          style={styles.whatsAppContainer}
        >
          <Text style={styles.openWhatsapp}>Open whatsapp</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderToggleButtons() {
    return (
      <View style={styles.box3}>
        <TouchableOpacity
          onPress={() => {
            setInformation(true), setMedicalHistory(false);
          }}
          style={[
            styles.informationContainer,
            {
              backgroundColor: information ? colors.white : colors.gray01,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontSize: textScale(16),
              fontWeight: "500",
              color: information ? colors.secondary : colors.gray03,
            }}
          >
            Information
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.informationContainer,
            {
              backgroundColor: medicalHistory ? colors.white : colors.gray01,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            setInformation(false), setMedicalHistory(true);
          }}
        >
          <Text
            style={{
              fontSize: textScale(16),
              fontWeight: "500",
              color: medicalHistory ? colors.secondary : colors.gray03,
            }}
          >
            Medical History
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderPatientInformation() {
    return (
      <KeyboardAwareScrollView style={{ flex: 1 }}>
        <PatientInformation
          editable={false}
          keyboardType={"number-pad"}
          text={item?.phoneNumber}
          icon={imagePath.icPhone}
        />
        <PatientInformation
          editable={false}
          text={item?.placeDateOfBirth}
          icon={imagePath.icGift}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={false}
          text={item?.homeAddress}
          icon={imagePath.icHome}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={false}
          text={item?.occupation}
          icon={imagePath.icBriefCase}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={false}
          text={item?.sex}
          icon={imagePath.icGender}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={false}
          text={item?.medicalHistory}
          icon={imagePath.icHeart}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />

        <PatientInformation
          editable={false}
          text={item?.ktpPassportNumber}
          icon={imagePath.icCredit}
          containerStyle={{
            marginTop: verticalScale(5),
          }}
        />
        <PatientInformation
          editable={false}
          text={item?.note}
          icon={imagePath.icEdit}
          containerStyle={{
            marginTop: verticalScale(5),
            borderBottomWidth: 0,
          }}
        />
      </KeyboardAwareScrollView>
    );
  }

  function renderExaminationMedicalHistory() {
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
            Examination
          </Text>

          <Image
            resizeMode="contain"
            source={imagePath.icUpArrow}
            style={styles.arrowStyle}
          />
        </View>
        <>
          {loadingExamination ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : dataOfExaminationPatients === undefined ||
            dataOfExaminationPatients.length === 0 ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No data found. Please create one.
            </Text>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: moderateScale(200) }}
            >
              {dataOfExaminationPatients
                .slice()
                .reverse()
                .map((item, index) => {
                  return (
                    <MedicalHistoryPatient
                      index={index}
                      onPressModal={() => {
                        setIsModalVisible(true),
                          setSelectedItem(item),
                          setSelectedItemIndex(index);
                        setKey("examination");
                      }}
                      key={`dataOfExaminationPatients-${index}`}
                      icon={imagePath.icBraces}
                      loadingExaminationDelete={loadingExaminationDelete}
                      sentence={`${item?.examinationDate} - ${item?.patientIssueObjective}`}
                    />
                  );
                })}
            </ScrollView>
          )}
        </>
      </TouchableOpacity>
    );
  }

  function renderPrescriptionMedicalHistory() {
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
            Perscription
          </Text>

          <Image
            resizeMode="contain"
            source={imagePath.icUpArrow}
            style={styles.arrowStyle}
          />
        </View>
        <>
          {loadingPrescription ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : dataOfPrescriptionPatients === undefined ||
            dataOfPrescriptionPatients.length === 0 ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No data found. Please create one.
            </Text>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: moderateScale(200) }}
            >
              {dataOfPrescriptionPatients
                .slice()
                .reverse()
                .map((item, index) => {
                  return (
                    <MedicalHistoryPatient
                      index={index}
                      key={`dataOfPrescriptionPatients-${index}`}
                      icon={imagePath.icEstimates}
                      sentence={`${item?.examinationDate} - ${item?.otherNote}`}
                      onPressModal={() => {
                        setIsModalVisible(true),
                          setSelectedItem(item),
                          setSelectedItemIndex(index);
                        setKey("prescription");
                      }}
                    />
                  );
                })}
            </ScrollView>
          )}
        </>
      </TouchableOpacity>
    );
  }

  function renderTreatmentMedicalHistory() {
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
            Treatment Plan
          </Text>

          <Image
            resizeMode="contain"
            source={imagePath.icUpArrow}
            style={styles.arrowStyle}
          />
        </View>
        <>
          {loadingTreatment ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : dataOfTreatmentPatients === undefined ||
            dataOfTreatmentPatients.length === 0 ? (
            <Text
              style={[
                styles.noSetupText,
                { textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              No data found. Please create one.
            </Text>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: moderateScale(200) }}
            >
              {dataOfTreatmentPatients
                .slice()
                .reverse()
                .map((item, index) => {
                  return (
                    <MedicalHistoryPatient
                      onPressModal={() => {
                        setIsModalVisible(true),
                          setSelectedItem(item),
                          setSelectedItemIndex(index);
                        setKey("treatment");
                      }}
                      index={index}
                      key={`dataOfTreatmentPatients-${index}`}
                      icon={imagePath.icTodo}
                      sentence={`${item?.examinationDate} - ${item?.nextSteps}`}
                    />
                  );
                })}
            </ScrollView>
          )}
        </>
      </TouchableOpacity>
    );
  }

  function renderMedicalHistory() {
    return (
      <>
        {examination ? (
          renderExaminationMedicalHistory()
        ) : (
          <TemplateNames
            label="Examination"
            onPress={() => setExamination(true)}
          />
        )}

        {prescription ? (
          renderPrescriptionMedicalHistory()
        ) : (
          <TemplateNames
            label="Perscription"
            onPress={() => setPrescription(true)}
          />
        )}

        {treatment ? (
          renderTreatmentMedicalHistory()
        ) : (
          <TemplateNames
            label="Treatment plan"
            onPress={() => setTreatment(true)}
          />
        )}
      </>
    );
  }

  function renderModal() {
    return (
      <View>
        <Modal
          onBackdropPress={() => setOpenModal(false)}
          isVisible={openModal}
        >
          <View style={[styles.modalStyle, { height: moderateScale(270) }]}>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              {/* Examination Template */}
              <TemplateOptions
                onPress={() => {
                  navigation.navigate(navigationStrings.EXAMINATION, {
                    patientIndex: itemIndex,
                    item: item,
                    key: "fromPatientProfile",
                  }),
                    setOpenModal(false);
                }}
                icon={imagePath.icDentalMachine}
                label="Examination"
              />

              {/* Prescriptions Template */}
              <TemplateOptions
                onPress={() => {
                  navigation.navigate(navigationStrings.PRESCRIPTION, {
                    patientIndex: itemIndex,
                    item: item,
                    key: "fromPatientProfile",
                  }),
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
                  navigation.navigate(navigationStrings.TREATMENT_PLAN, {
                    patientIndex: itemIndex,
                    item: item,
                    key: "fromPatientProfile",
                  }),
                    setOpenModal(false);
                }}
                icon={imagePath.icWhatIDo}
                label="Treatment plan"
                containerStyle={{ marginTop: verticalScale(30) }}
              />
              <TemplateOptions
                onPress={() => navigation.navigate(navigationStrings.AGENDA)}
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

  function renderDateRange() {
    return (
      <View>
        <Modal
          onBackdropPress={() => setDateRange(false)}
          isVisible={dateRange}
        >
          <View style={styles.modalStyle4}>
            <Text style={styles.dateRangeSelect}>Select Date Range</Text>

            {/* Start Date */}
            <View>
              <Text style={styles.dateStyleText}>Start Date</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginHorizontal: moderateScale(20),
                }}
              >
                <CustomTextInput
                  editable={false}
                  value={formattedDate}
                  containerStyle={styles.textInputContainer2}
                  inputStyle={styles.inputStyle2}
                  showIcon={true}
                  icon={imagePath.icCalendar}
                  showPassword={showDatePicker1}
                />
              </View>
            </View>

            {/* End Date */}
            <View>
              <Text style={styles.dateStyleText}>End Date</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginHorizontal: moderateScale(20),
                }}
              >
                <CustomTextInput
                  editable={false}
                  value={formattedDate2}
                  containerStyle={styles.textInputContainer2}
                  inputStyle={styles.inputStyle2}
                  showIcon={true}
                  icon={imagePath.icCalendar}
                  showPassword={showDatePicker2}
                />
              </View>
            </View>
            <CustomButton
              onPress={handleFilterData}
              label="Create Report"
              containerStyle={{
                marginTop: verticalScale(10),
              }}
              loading={creatingReport}
            />

            {datePicker1 && (
              <>
                <DateTimePicker
                  value={date1}
                  mode={"date"}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  is24Hour={true}
                  onChange={onDateSelected1}
                  style={styles.datePicker}
                  textColor={colors.black}
                />
                <CustomButton
                  onPress={() => setDatePicker1(false)}
                  containerStyle={styles.cancelButton}
                  label="Cancel"
                  labelStyle={styles.cancelButtonLabel}
                />
              </>
            )}
            {datePicker2 && (
              <>
                <DateTimePicker
                  value={date2}
                  mode={"date"}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  is24Hour={true}
                  onChange={onDateSelected2}
                  style={styles.datePicker}
                  textColor={colors.black}
                />
                <CustomButton
                  onPress={() => setDatePicker2(false)}
                  containerStyle={styles.cancelButton}
                  label="Cancel"
                  labelStyle={styles.cancelButtonLabel}
                />
              </>
            )}
          </View>
        </Modal>
      </View>
    );
  }

  function navigateExamination(item) {
    navigation.navigate(navigationStrings.EXAMINATION, {
      item: item,
      patientIndex: "",
      key: "preview",
    });
    setIsModalVisible(false);
  }

  function navigatePrescription(item) {
    navigation.navigate(navigationStrings.PRESCRIPTION, {
      item: item,
      patientIndex: "",
      key: "preview",
    });
    setIsModalVisible(false);
  }

  function navigateTreatment(item) {
    navigation.navigate(navigationStrings.TREATMENT_PLAN, {
      item: item,
      patientIndex: "",
      key: "preview",
    });
    setIsModalVisible(false);
  }

  function renderOptionsModal() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Modal
          isVisible={isModalVisible}
          style={{
            justifyContent: "flex-end",
            margin: 0,
          }}
          onBackdropPress={() => setIsModalVisible(false)}
          swipeDirection={["down"]}
          onSwipeComplete={() => setIsModalVisible(false)}
        >
          <View style={styles.bottomContainer}>
            <Options
              onPress={
                key === "examination"
                  ? () => navigateExamination(selectedItem)
                  : key === "prescription"
                  ? () => navigatePrescription(selectedItem)
                  : key === "treatment"
                  ? () => navigateTreatment(selectedItem)
                  : null
              }
              icon={imagePath.icView}
              label="View"
            />
            <Options
              onPress={
                key === "examination"
                  ? () => handleEditExamination(selectedItem)
                  : key === "prescription"
                  ? () => handleEditPrescription(selectedItem)
                  : key === "treatment"
                  ? () => handleEditTreatment(selectedItem)
                  : null
              }
              icon={imagePath.icEditIcon}
              label="Edit"
            />
            <Options
              onPress={
                key === "examination"
                  ? () =>
                      handleShareExamination(selectedItem, selectedItemIndex)
                  : key === "prescription"
                  ? () => {
                      setIsModalVisible(false);
                      handleSharePrescription(selectedItem, selectedItemIndex);
                    }
                  : key === "treatment"
                  ? () => handleShareTreatment(selectedItem)
                  : null
              }
              icon={imagePath.icShare}
              label="Share"
            />
            <Options
              onPress={
                key === "examination"
                  ? () => deleteAlertExamination(selectedItem._id)
                  : key === "prescription"
                  ? () => deleteAlertPrescription(selectedItem._id)
                  : key === "treatment"
                  ? () => deleteAlertTreatment(selectedItem._id)
                  : null
              }
              icon={imagePath.icDelete}
              label="Delete"
              deleteStyles={{
                tintColor: colors.red,
              }}
              labelStyle={{
                color: colors.red,
              }}
            />
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          {Platform.OS == "android" && (
            <View
              style={{
                height: 15,
              }}
            />
          )}
          {renderHeader()}
          {renderProfileImage()}
          {renderNameOfPatient()}
          {renderWhatsapp()}
          {renderToggleButtons()}
          {information && renderPatientInformation()}
          {medicalHistory && renderMedicalHistory()}
          {medicalHistory && (
            <CustomButton
              onPress={() => setDateRange(true)}
              label="Create Medical History Report (PDF)"
            />
          )}
          {openModal && renderModal()}
          {dateRange && renderDateRange()}
          {isModalVisible && renderOptionsModal()}
        </ScrollView>
      </SafeAreaView>
      <ModalPreview visible={isModalPreview}></ModalPreview>
    </GestureHandlerRootView>
  );
};

export default PatientProfile;
