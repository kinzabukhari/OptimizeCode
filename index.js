import { useEffect, useState } from "react";
import StudentsPicker from "../components/StudentsPicker";
import StudentsTable from "../components/StudentsTable";
import {
  fetchStudentData,
  fetchSchoolData,
  fetchLegalguardianData,
} from "../utils";

const StudentsDataComponent = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [schoolsData, setSchoolsData] = useState([]);
  const [legalGuardiansData, setLegalGuardiansData] = useState([]);

  const fetchStudentDetails = async (studentId) => {
    try {
      const studentData = await fetchStudentData(studentId);
      setStudentsData((prevStudentsData) => [...prevStudentsData, studentData]);

      for (const student of studentData) {
        const { schoolId, legalguardianId } = student;

        const [schoolData, legalGuardianData] = await Promise.all([
          fetchSchoolData(schoolId),
          fetchLegalguardianData(legalguardianId),
        ]);

        setSchoolsData((prevSchoolsData) => [...prevSchoolsData, schoolData]);
        setLegalGuardiansData((prevLegalGuardiansData) => [
          ...prevLegalGuardiansData,
          legalGuardianData,
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch student details:", error);
    }
  };

  const onStudentsPick = async (studentIds) => {
    try {
      for (const studentId of studentIds) {
        await fetchStudentDetails(studentId);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const additionalSchoolDataPromises = studentsData.map(
          async (student) => {
            const schoolData = await fetchSchoolData(student.schoolId);
            return schoolData;
          }
        );

        const additionalLegalGuardianDataPromises = studentsData.map(
          async (student) => {
            const legalGuardianData = await fetchLegalguardianData(
              student.legalguardianId
            );
            return legalGuardianData;
          }
        );

        const additionalSchoolData = await Promise.all(
          additionalSchoolDataPromises
        );
        const additionalLegalGuardianData = await Promise.all(
          additionalLegalGuardianDataPromises
        );

        setSchoolsData((prevSchoolsData) => [
          ...prevSchoolsData,
          ...additionalSchoolData,
        ]);
        setLegalGuardiansData((prevLegalGuardiansData) => [
          ...prevLegalGuardiansData,
          ...additionalLegalGuardianData,
        ]);
      } catch (error) {
        console.error("Failed to fetch additional data:", error);
      }
    };

    if (studentsData.length > 0) {
      fetchAdditionalData();
    }
  }, [studentsData]);

  return (
    <>
      <StudentsPicker onPickHandler={onStudentsPick} />
      <StudentsTable
        studentsData={studentsData}
        schoolsData={schoolsData}
        legalGuardiansData={legalGuardiansData}
      />
    </>
  );
};

export default StudentsDataComponent;
