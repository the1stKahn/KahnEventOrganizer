import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import colors from "../../../styles/colors";
import styles from "./styles";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../../../styles/responsiveSize";
import {
  AgendaContent,
  CustomButton,
  CustomTextInput,
} from "../../../components";
import Modal from "react-native-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import imagePath from "../../../constants/imagePath";
import { auth, db } from "../../../database/firebase";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
const Agenda = ({ navigation }) => {
  const [selected, setSelected] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [openModal, setOpenModal] = useState(false);
  const [datePicker, setDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [timePicker, setTimePicker] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [time, setTime] = useState(new Date());
  const [patientName, setPatientName] = useState("");
  const [location, setLocation] = useState("");
  const [period, setPeriod] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [key, setKey] = useState("");
  const [idOfAppointment, setIdOfAppointment] = useState("");

  // Constants
  const originalDate = date.toDateString();
  const parsedDate = new Date(originalDate);
  const formattedDate = `${getDayAbbreviation(parsedDate)} ${getFormattedDate(
    parsedDate
  )}`;

  // Calling Appointments Details
  useEffect(() => {
    getAllAppointments();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getAllAppointments();
    }, [])
  );

  // Getting Data from Firestore

  const getAllAppointments = async () => {
    setLoadingAppointments(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAppointments(data.appointments);
          setLoadingAppointments(false);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Adding Appointment to Firestore

  const addAppointment = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const appointmentData = {
          _id: Date.now().toString() + Math.random().toString(36).substring(7),
          name: patientName,
          date: date,
          time: time,
          location: location,
          period: period,
        };
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          appointments: arrayUnion(appointmentData),
        });

        setLoading(false);
        setPatientName("");
        setLocation("");
        setPeriod("");
        Alert.alert("Appointment added successfully");
        setOpenModal(false);
        setDatePicker(false);
        setTimePicker(false);
        getAllAppointments();
      } catch (error) {
        console.log("Error adding appointment to Firestore:", error);
      }
    }
  };

  // Updating Appointment in Firestore

  const updateAppointment = async (id) => {
    setLoading(true);
    const user = auth.currentUser;

    if (user) {
      try {
        const updatedData = {
          name: patientName,
          date: date,
          time: time,
          location: location,
          period: period,
        };
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const appointments = userDoc.data().appointments || [];
          const updatedAppointments = appointments.map((appointment) => {
            if (appointment._id === id) {
              return { ...appointment, ...updatedData };
            }
            return appointment;
          });

          await updateDoc(userRef, {
            appointments: updatedAppointments,
          });

          setLoading(false);
          Alert.alert("Appointment updated successfully");
          getAllAppointments();
          setOpenModal(false);
          setDatePicker(false);
          setTimePicker(false);
          setPatientName("");
          setLocation("");
          setPeriod("");
          setKey("");
        }
      } catch (error) {
        console.log("Error updating appointment in Firestore:", error);
      }
    }
  };

  const handleDayPress = (day) => {
    setSelected(day.dateString);
    setDate(new Date(day.dateString));
  };

  const onBackdropPress = () => {
    setPatientName("");
    setLocation("");
    setPeriod("");
    setOpenModal(false);
    setDatePicker(false);
    setTimePicker(false);
    setKey("");
  };

  // Handler

  const handleInputChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, "");
    const limitedValue = Math.min(parseInt(numericText || "0"));
    const limitedValueStr = String(limitedValue);
    if (limitedValueStr.length > 3) {
      const truncatedValue = limitedValueStr.slice(0, 3);
      setPeriod(truncatedValue);
    } else {
      setPeriod(limitedValueStr);
    }
  };

  const handleEdit = async (item, index) => {
    setOpenModal(true);
    setPatientName(item.name);
    setLocation(item.location);
    setPeriod(item.period);
    setDate(item.date.toDate());
    setTime(item.time.toDate());
    setIdOfAppointment(item._id);
    setKey("edit");
  };

  const handleDelete = async (id) => {
    setLoadingAppointments(true);
    const user = auth.currentUser;

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const appointments = userDoc.data().appointments || [];
          const updatedAppointments = appointments.filter(
            (appointment) => appointment._id !== id
          );

          await updateDoc(userRef, {
            appointments: updatedAppointments,
          });

          setAppointments(updatedAppointments);
          Alert.alert("Appointment deleted successfully");
        }

        setLoadingAppointments(false);
        getAllAppointments();
      } catch (error) {
        console.log(error);
      }
    }
  };

  function getDayAbbreviation(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }

  function getFormattedDate(date) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}/${day}/${year}`;
  }

  function showDatePicker() {
    setDatePicker(true);
    setTimePicker(false);
  }

  function showTimePicker() {
    setTimePicker(true);
    setDatePicker(false);
  }

  function onDateSelected(event, value) {
    setDate(value);
    if (Platform.OS === "android") {
      setDatePicker(false);
    }
  }

  function onTimeSelected(event, value) {
    setTime(value);
    if (Platform.OS === "android") {
      setTimePicker(false);
    }
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
          <Text style={styles.profileTextStyle}>Agenda</Text>
        </View>
      </View>
    );
  }

  function renderCalendar() {
    return (
      <Calendar
        onDayPress={(day) => handleDayPress(day)}
        markedDates={{
          [selected]: {
            selected: true,
            disableTouchEvent: true,
            selectedDotColor: "orange",
          },
        }}
      />
    );
  }

  function renderTimings() {
    const filteredAppointments = appointments
      ? appointments.filter((item) => {
          const appointmentDate = item.date.toDate();
          const formattedAppointmentDate = appointmentDate
            .toISOString()
            .split("T")[0];
          return formattedAppointmentDate === selected;
        })
      : [];

    // Sort the filteredAppointments array based on time
    filteredAppointments.sort((a, b) => {
      const timeA = a.time.toDate();
      const timeB = b.time.toDate();
      return timeA - timeB;
    });

    return (
      <>
        {loadingAppointments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.secondary} />
          </View>
        ) : filteredAppointments === undefined ||
          filteredAppointments.length === 0 ? (
          <Text style={styles.noAppointments}>No Appointments</Text>
        ) : (
          <View>
            {filteredAppointments.map((item, index) => (
              <AgendaContent
                key={index}
                label={`${item.time.toDate().toLocaleTimeString("en-Us", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}  ${item.name} - ${item.location}`}
                time={`${item.period} mins`}
                onPressEdit={() => handleEdit(item, index)}
                onPressDelete={() => handleDelete(item._id)}
              />
            ))}
          </View>
        )}
      </>
    );
  }

  function renderModal() {
    return (
      <View>
        <Modal onBackdropPress={onBackdropPress} isVisible={openModal}>
          <View style={styles.keyBoardAwareStyle}>
            <KeyboardAwareScrollView>
              <View
                style={[styles.container1, { marginTop: verticalScale(20) }]}
              >
                <Text style={styles.heading}>Patient Name</Text>
                <CustomTextInput
                  value={patientName}
                  onChangeValue={(text) => setPatientName(text)}
                  containerStyle={styles.textInputContainer}
                  inputStyle={{ paddingHorizontal: scale(5) }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <View style={styles.container1}>
                  {/* Date  */}
                  <Text style={styles.heading}>Date</Text>

                  <CustomTextInput
                    editable={false}
                    value={formattedDate}
                    containerStyle={styles.textInputContainer2}
                    inputStyle={styles.inputStyle2}
                    icon={imagePath.icCalendar}
                    showIcon={!datePicker}
                    iconStylesInTextInput={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                    }}
                    showPassword={showDatePicker}
                  />
                </View>
                <View style={styles.container1}>
                  {/* Time */}
                  <Text style={styles.heading}>Start Time</Text>
                  <CustomTextInput
                    editable={false}
                    value={time.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    containerStyle={styles.textInputContainer2}
                    inputStyle={styles.inputStyle2}
                    icon={imagePath.icClock}
                    showIcon={!timePicker}
                    iconStylesInTextInput={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                    }}
                    showPassword={showTimePicker}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row" }}>
                <View style={styles.container1}>
                  <Text style={styles.heading}>Location</Text>
                  <CustomTextInput
                    value={location}
                    onChangeValue={(text) => setLocation(text)}
                    containerStyle={{
                      backgroundColor: colors.gray01,
                      width: moderateScale(180),
                      marginTop: verticalScale(5),
                      height: moderateScale(50),
                    }}
                    inputStyle={{ paddingHorizontal: scale(5) }}
                  />
                </View>
                <View style={styles.container1}>
                  <Text style={styles.heading}>Period</Text>
                  <CustomTextInput
                    value={period}
                    multiline={false}
                    onChangeValue={handleInputChange}
                    containerStyle={{
                      backgroundColor: colors.gray01,
                      width: moderateScale(60),
                      marginTop: verticalScale(5),
                      paddingHorizontal: scale(5),
                      height: moderateScale(50),
                    }}
                    inputStyle={{ paddingHorizontal: scale(5) }}
                    keyboardType={"numeric"}
                  />
                </View>
              </View>
              <CustomButton
                loading={loading}
                onPress={
                  key === "edit"
                    ? () => updateAppointment(idOfAppointment)
                    : addAppointment
                }
                containerStyle={styles.addButton}
                label={key === "edit" ? "Update" : "Add"}
              />

              {datePicker && (
                <>
                  <DateTimePicker
                    value={date}
                    mode={"date"}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    is24Hour={true}
                    onChange={onDateSelected}
                    style={styles.datePicker}
                    minimumDate={new Date()}
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

              {timePicker && (
                <>
                  <DateTimePicker
                    value={time}
                    mode={"time"}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    is24Hour={false}
                    onChange={onTimeSelected}
                    style={styles.datePicker}
                    timeZoneOffsetInSeconds={3600}
                    textColor={colors.black}
                  />
                  <CustomButton
                    onPress={() => setTimePicker(false)}
                    containerStyle={styles.cancelButton}
                    label="Cancel"
                    labelStyle={styles.cancelButtonLabel}
                  />
                </>
              )}
            </KeyboardAwareScrollView>
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
      {renderHeader()}
      {renderCalendar()}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {renderTimings()}
        {openModal && renderModal()}
      </ScrollView>
      <CustomButton
        onPress={() => setOpenModal(true)}
        containerStyle={{ marginBottom: verticalScale(40) }}
        label="Create New Appointment"
      />
    </SafeAreaView>
  );
};

export default Agenda;
