const VALID_KEYS = ["name", "price", "currency", "frequency", "startdate"];
const VALID_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

export const validateKeyValue = (key, value) => {
  switch (key) {
    case "name":
      return typeof value === "string" && value.trim().length > 0;
    case "price":
      return !isNaN(parseFloat(value)) && isFinite(value);
    case "currency":
      return typeof value === "string" && value.trim().length === 3;
    case "frequency":
      return VALID_FREQUENCIES.includes(value.toLowerCase());
    case "startdate":
      return isValidDateFormat(value);
    default:
      return false;
  }
};

export const parseDetailLine = (line) => {

  if (!line.includes("-")) {
    throw new Error("Invalid format: missing separator '-'");
  }

  let [key, value] = line.split("-").map(part => part.trim());
  
  if (!VALID_KEYS.includes(key)) {
    throw new Error(`Invalid key: ${key}`);
  }

  if (!validateKeyValue(key, value)) {
    throw new Error(`Invalid value for ${key}: ${value}`);
  }

  if (key === "startdate") {
    const [year, month, day] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in 
    
    value = date;
  }

  return { key, value };
};

export const isValidDateFormat = (dateStr) => {
  // Regex for YYYY/MM/DD
  const regex = /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
  return regex.test(dateStr);
}

export const validateIntegerInput = (input) => {
  return !isNaN(parseFloat(input)) && isFinite(input);
}