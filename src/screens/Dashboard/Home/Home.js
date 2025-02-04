import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { CustomButton } from "../../../components";
import {
  scale,
  textScale,
  verticalScale,
} from "../../../styles/responsiveSize";
import navigationStrings from "../../../constants/navigationStrings";
import { auth, db } from "../../../database/firebase";
import { doc, getDoc } from "firebase/firestore";
import colors from "../../../styles/colors";
import imagePath from "../../../constants/imagePath";
import { useFocusEffect } from "@react-navigation/native";

const Home = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [lookStatistics, setLookStatistics] = useState(false);
  const [totalPatients, setTotalPatients] = useState([]);
  const [patinetLength, setPatientLength] = useState("");
  const [examinationLength, setExaminationLength] = useState("");
  const [totalExamination, setTotalExamination] = useState("");

  useEffect(() => {
    getAllAppointments();
  }, []);

  // Calling User Name

  useEffect(() => {
    getCurrentUserDataFromFirestore();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getAllAppointments();
      getCurrentUserDataFromFirestore();
    }, [])
  );

  // Get data from Firestore

  const getAllAppointments = async () => {
    try {
      setLoadingAppointments(true);

      const user = auth.currentUser;
      if (!user) {
        console.log("User not authenticated");
        setLoadingAppointments(false);
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const { fullName, patients, appointments } = userData;

        setFullName(fullName);
        setAppointments(appointments);

        const currentMonth = new Date().getMonth() + 1;

        let patientIndex = 0;
        let exaIndex = 0;
        let totalMediPrice = 0;
        if (Array.isArray(patients)) {
          for (const [patient] of patients.entries()) {
            const { examination } = patient;

            const currentMonthExamination = examination?.filter(
              (exa) =>
                parseInt(exa.examinationDate.split("-")[1]) === currentMonth
            );

            exaIndex += currentMonthExamination?.length || 0;

            patientIndex += currentMonthExamination?.length ? 1 : 0;

            if (examination?.length) {
              for (const exa of currentMonthExamination) {
                const { medicalTreatment } = exa;

                for (const medi of medicalTreatment) {
                  totalMediPrice += parseInt(medi?.pricePerUnit);
                }
              }
            }
          }
        } else {
          console.log("Patients data is missing or not an array.");
        }

        setPatientLength(patientIndex || 0);
        setExaminationLength(exaIndex || 0);
        setTotalExamination(totalMediPrice || 0);

        setLoadingAppointments(false);
      } else {
        console.log("No such document!");
        setLoadingAppointments(false);
      }
    } catch (error) {
      console.error(error);
      setLoadingAppointments(false);
    }
  };

  const getCurrentUserDataFromFirestore = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setFullName(userData.fullName);
          setTotalPatients(userData.patients);
        } else {
          console.log("User data not found in Firestore");
        }
      } catch (error) {
        console.log("Error getting user data from Firestore:", error);
      }
    } else {
      console.log("No user is signed in");
    }
  };

  // Render

  function renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <Text
          style={{
            fontSize: textScale(25),
            fontWeight: "bold",
            fontFamily: "I-Bold",
          }}
        >
          Dental Clinic
        </Text>
      </View>
    );
  }

  function renderScheduleContainer() {
    const currentDate = new Date();
    const date = currentDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const nextDay = new Date();
    nextDay.setDate(currentDate.getDate() + 1);
    const nextDate = nextDay.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const filteredAppointments = appointments
      ? appointments
          .filter((item) => {
            const itemDate = item.date.toDate().toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return itemDate === date || itemDate === nextDate;
          })
          .sort((a, b) => {
            const dateA = a.date.toDate();
            const dateB = b.date.toDate();

            if (dateA.toDateString() === dateB.toDateString()) {
              const timeA = a.time.toDate().getTime();
              const timeB = b.time.toDate().getTime();
              return timeA - timeB;
            } else {
              return dateA - dateB;
            }
          })
      : [];
    const groupAppointmentsByDate = () => {
      const groupedAppointments = {};
      filteredAppointments.forEach((item) => {
        const dateKey = item.date.toDate().toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        if (groupedAppointments[dateKey]) {
          groupedAppointments[dateKey].push(item);
        } else {
          groupedAppointments[dateKey] = [item];
        }
      });
      return groupedAppointments;
    };
    const groupedAppointments = groupAppointmentsByDate();
    const groupedAppointmentsArray = Object.entries(groupedAppointments);

    return (
      <>
        {loadingAppointments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.secondary} />
          </View>
        ) : groupedAppointmentsArray.length === 0 ? (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleText}>Schedule</Text>
            <View style={styles.scheduleListingContainer}>
              <Text style={styles.noAppointments}>
                Hey {fullName} No appointments today. Please create one
              </Text>
              <CustomButton
                onPress={() => navigation.navigate(navigationStrings.AGENDA)}
                containerStyle={styles.buttonContainerStyle}
                labelStyle={styles.createAppointmentButton}
                label="Create New Appointment"
              />
            </View>
          </View>
        ) : (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleText}>Schedule</Text>
            <View style={styles.scheduleListingContainer}>
              {groupedAppointmentsArray.map(([date, appointments], index) => (
                <View
                  key={`Appointments-${index}`}
                  style={styles.textContainer}
                >
                  <Text style={styles.dayStyles}>{date}</Text>
                  {appointments.map((item, i) => (
                    <View
                      key={`Appointment-${i}`}
                      style={styles.textContainer2}
                    >
                      <Text style={styles.scheduleDay2}>
                        {i + 1}:{" "}
                        {item.time.toDate().toLocaleTimeString("en-Us", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {item.name}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
              <CustomButton
                onPress={() => navigation.navigate(navigationStrings.AGENDA)}
                containerStyle={styles.buttonStyle}
                label="See Agenda"
              />
            </View>
          </View>
        )}
      </>
    );
  }

  function renderStatisticsContainer() {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentDate.getFullYear();

    return (
      <View style={styles.statisticsContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.statisticsText}>Statistics</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setLookStatistics(!lookStatistics)}
          >
            <Image
              source={lookStatistics ? imagePath.icView : imagePath.icHide}
              style={{ width: 20, height: 20, marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>

        {lookStatistics ? (
          <View style={styles.statisticsListingContainer}>
            <Text style={styles.dateStyle}>
              {currentMonth} {currentYear}
            </Text>
            <View style={styles.contentContainer}>
              <View style={styles.makeThemCenter}>
                <Text style={styles.numberStyle}>{patinetLength}</Text>
                <Text style={styles.wordsStyle}>Patients</Text>
              </View>
              <View style={[styles.makeThemCenter, { marginLeft: scale(20) }]}>
                <Text style={styles.numberStyle}>{examinationLength}</Text>
                <Text style={styles.wordsStyle}>Examinations</Text>
              </View>
            </View>
            <Text
              style={[
                styles.numberStyle,
                { paddingTop: verticalScale(20), textAlign: "center" },
              ]}
            >
              Rp {totalExamination}
            </Text>
            <Text
              style={[
                styles.wordsStyle,
                { textAlign: "center", paddingVertical: verticalScale(5) },
              ]}
            >
              Income
            </Text>
          </View>
        ) : null}
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
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {renderScheduleContainer()}
        {renderStatisticsContainer()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
