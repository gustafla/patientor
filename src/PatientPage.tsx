import React, { useEffect } from "react";
import { apiBaseUrl } from "./constants";
import { Patient, Entry, Diagnosis, HospitalEntry, OccupationalHealthcareEntry, HealthCheckEntry } from "./types";
import { useStateValue, updatePatient, addEntry } from "./state";
import axios from "axios";
import { useParams } from "react-router-dom";
import AddEntryForm, { EntryFormValues } from "./AddEntryForm";

const HospitalEntryDetails = ({ entry }: { entry: HospitalEntry }) => {
  return (
    <div>
      <p>Type: hospital entry</p>
      <p>Discharge: {entry.discharge.date} ({entry.discharge.criteria})</p>
    </div>
  );
};

const OccupationalHealthcareEntryDetails = ({ entry }: { entry: OccupationalHealthcareEntry }) => {
  return (
    <div>
      <p>Type: occupational healthcare entry ({entry.employerName})</p>
      {entry.sickLeave ? <p>Sick leave {entry.sickLeave.startDate} - {entry.sickLeave.endDate}</p> : null}
    </div>
  );
};

const HealthCheckEntryDetails = ({ entry }: { entry: HealthCheckEntry }) => {
  return (
    <div>
      <p>Type: health check entry</p>
      <p>Rating: {entry.healthCheckRating}</p>
    </div>
  );
};

const PatientEntry = ({ entry }: { entry: Entry }) => {
  const [{ diagnoses }] = useStateValue();

  const diagName = (code: Diagnosis['code']) => diagnoses[code] ? diagnoses[code].name : null;

  const assertNever = (value: never): never => {
    throw new Error(`Unhandled entry type: ${JSON.stringify(value)}`);
  };

  let details = null;

  switch (entry.type) {
    case "Hospital":
      details = <HospitalEntryDetails entry={entry} />;
      break;
    case "OccupationalHealthcare":
      details = <OccupationalHealthcareEntryDetails entry={entry} />;
      break;
    case "HealthCheck":
      details = <HealthCheckEntryDetails entry={entry} />;
      break;
    default:
      return assertNever(entry);
  }

  return (
    <div style={{ border: '1px solid black' }}>
      <p>{entry.date} <i>{entry.description}</i></p>
      {details}
      {entry.diagnosisCodes ?
        (<ul>
          {entry.diagnosisCodes.map(code => <li key={code}>{code} {diagName(code)}</li>)}
        </ul>) : null}
      <p>diagnose by {entry.specialist}</p>
    </div>
  );
};

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

  const submitNewEntry = (values: EntryFormValues) => {
    void (async () => {
      try {
        const { data: newEntry } = await axios.post<Entry>(
          `${apiBaseUrl}/patients/${patient.id}/entries`,
          values
        );
        dispatch(addEntry(patient, newEntry));
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          console.error(e?.response?.data || "Unrecognized axios error");
          //setError(String(e?.response?.data?.error) || "Unrecognized axios error");
        } else {
          console.error("Unknown error", e);
          //setError("Unknown error");
        }
      }
    })();
  };

  return (
    <div>
      <h2>{patient.name}</h2>
      <p>{patient.gender}</p>
      <p>occupation: {patient.occupation}</p>
      <p>ssn: {patient.ssn}</p>
      <p>date of birth: {patient.dateOfBirth}</p>
      <h3>add entry</h3>
      <AddEntryForm onSubmit={submitNewEntry} />
      <h3>entries</h3>
      {patient.entries ?
        patient.entries.map(entry => <PatientEntry key={entry.id} entry={entry} />)
        : null}
    </div>
  );
};

export default PatientPage;