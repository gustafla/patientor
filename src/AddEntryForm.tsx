import { Button } from "@material-ui/core";
import { DiagnosisSelection, TextField, NumberField } from "./FormField";
import { Field, Formik, Form } from "formik";
import { useStateValue } from "./state";
import { HealthCheckEntry, UnionOmit, HealthCheckRating } from "./types";

export type EntryFormValues = UnionOmit<HealthCheckEntry, "id">;

interface Props {
  onSubmit: (values: EntryFormValues) => void;
}

const AddEntryForm = ({ onSubmit }: Props) => {
  const [{ diagnoses }] = useStateValue();

  return (
    <Formik
      initialValues={{
        type: "HealthCheck",
        healthCheckRating: HealthCheckRating.Healthy,
        description: "",
        date: new Date().toISOString().split("T", 1)[0],
        specialist: "",
        diagnosisCodes: [],
      }}
      onSubmit={onSubmit}
      validate={values => {
        const requiredError = "Field is required";
        const errors: { [field: string]: string } = {};
        if (!values.description) {
          errors.description = requiredError;
        }
        if (!values.date) {
          errors.date = requiredError;
        }
        if (!values.specialist) {
          errors.specialist = requiredError;
        }
        if (!values.healthCheckRating) {
          errors.healthCheckRating = requiredError;
        }
        if (values.healthCheckRating < 0 && values.healthCheckRating > 3) {
          errors.healthCheckRating = requiredError;
        }
        return errors;
      }}
    >
      {({ isValid, dirty, setFieldValue, setFieldTouched }) => {
        return (
          <Form className="form ui">
            <Field
              label="Description"
              placeholder="Description"
              name="description"
              component={TextField}
            />
            <Field
              label="Date"
              placeholder="YYYY-MM-DD"
              name="date"
              component={TextField}
            />
            <Field
              label="Specialist"
              placeholder="Specialist"
              name="specialist"
              component={TextField}
            />
            <Field
              label="Rating"
              placeholder="Rating 0-3"
              name="healthCheckRating"
              component={NumberField}
            />
            <DiagnosisSelection
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
              diagnoses={Object.values(diagnoses)}
            />
            <Button
              style={{
                float: "right",
              }}
              type="submit"
              variant="contained"
              disabled={!dirty || !isValid}
            >
              Add
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddEntryForm;
