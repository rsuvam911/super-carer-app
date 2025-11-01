const formatTimeTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  let period = "AM";
  let hours12 = hours;

  if (hours >= 12) {
    period = "PM";
    if (hours > 12) {
      hours12 = hours - 12;
    }
  }
  if (hours === 0) {
    hours12 = 12;
  }

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export default formatTimeTo12Hour;
