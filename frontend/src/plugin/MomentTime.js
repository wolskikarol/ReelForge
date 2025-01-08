import moment from "moment";

function MomentWithTime(date) {
  return moment(date).format("DD.MM.YYYY. HH:mm:ss");
}

export default MomentWithTime;
