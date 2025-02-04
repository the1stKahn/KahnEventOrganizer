function isValidPhoneNumber(value) {
  const phoneNumberRegex = /^[0-9]{10,}$/; // Matches 10 or more digits
  return phoneNumberRegex.test(value);
}

function validatePhoneNumber(value, setPhoneError) {
  if (value === "") {
    setPhoneError("");
  } else if (isValidPhoneNumber(value)) {
    setPhoneError("");
  } else {
    setPhoneError("Must be 10 digits without area code");
  }
}

function isValidEmail(value) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(value).toLowerCase());
}

function validateEmail(value, setEmailError) {
  if (value == "") {
    setEmailError("");
  } else if (isValidEmail(value)) {
    setEmailError("");
  } else {
    setEmailError("Invalid Email (test123@gmail.com)");
  }
}

function validatePassword(value, setPasswordError) {
  let errorMessage = "";

  if (value.length < 6) {
    errorMessage += "Password must be 6 characters. ";
  }

  if (!/[A-Z]/.test(value)) {
    errorMessage += "One uppercase letter. ";
  }

  if (!/[a-z]/.test(value)) {
    errorMessage += "One lowercase letter. ";
  }

  if (!/[0-9]/.test(value)) {
    errorMessage += "One number. ";
  }

  if (!/[@$!%*?&#]/.test(value)) {
    errorMessage += "One special character. ";
  }

  setPasswordError(errorMessage.trim());
}

function validatePricePerUnit(value, setPricePerUnitError) {
  if (value === "") {
    setPricePerUnitError("");
  } else if (
    !isNaN(value) &&
    parseInt(value) > 0 &&
    !value.includes(".") &&
    !value.includes(",")
  ) {
    setPricePerUnitError("");
  } else {
    setPricePerUnitError("Invalid price. Must be a positive whole number.");
  }
}

const utils = {
  isValidEmail,
  isValidPhoneNumber,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validatePricePerUnit,
};

export default utils;
