import React, { useEffect } from "react";
import { apiBaseUrl } from "./constants";
import { Patient } from "./types";
import { useStateValue, updatePatient } from "./state";
import axios from "axios";
import { useParams } from "react-router-dom";

const PatientPage = () => {
  const [{ patients }, dispatch] = useStateValue();
  const { id } = useParams();

  if (id === undefined) {
    return null;
  }

  useEffect(() => {
    void (async () => {
      if (!patient?.ssn) {
        try {
          console.log('fetching patient details');
          const { data } = await axios.get<Patient>(`${apiBaseUrl}/patients/${id}`);
          dispatch(updatePatient(data));
        } catch (e: unknown) {
          if (axios.isAxiosError(e)) {
            console.error(e?.response?.data || "Unrecognized axios error");
          } else {
            console.error("Unknown error", e);
          }
        }
      }
    })();
  }, []);

  const patient = patients[id];

  if (!patient) {
    return <div>Unknown patient</div>;
  }

  return (
    <div>
      <h2>{patient.name}</h2>
      <p>{patient.gender}</p>
      <p>occupation: {patient.occupation}</p>
      <p>ssn: {patient.ssn}</p>
      <p>date of birth: {patient.dateOfBirth}</p>
    </div>
  );
};

export default PatientPage;