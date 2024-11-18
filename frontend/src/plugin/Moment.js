import moment from "moment";

function Moment(date) {
    return moment(date).format("DD.MM.YYYY.");
}
export default Moment;
