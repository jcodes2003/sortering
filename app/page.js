"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import Header from "../components/Header";
import FileInput from "../components/FileInput";
import SelectSection from "../components/SelectSection";
import ExportButton from "../components/ExportButton";
import TableDisplay from "../components/TableDisplay";



export default function ExcelUploader() {
    const [data, setData] = useState([]);
    const [uniqueSections, setUniqueSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState("all");

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                defval: "", // Set default value for empty cells
            });

            // Extract unique sections (support files that use either 'Section' or 'Class' column)
            const validSections = jsonData
                .map((item) => (item.Section ?? item.Class ?? item.section ?? item.SectionName)?.toString().trim() || "")
                .filter((sectionName) => sectionName !== "");
            const sections = new Set(validSections);

            setUniqueSections(["all", ...Array.from(sections)]);
            setData(jsonData);
        };

        reader.readAsBinaryString(file);
    };



    const exportToExcel = (sectionData) => {
        const ws = XLSX.utils.json_to_sheet(sectionData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Section Data");
        XLSX.writeFile(wb, `${selectedSection}_data.xlsx`);
    };

    const filteredData =
        selectedSection === "all"
            ? data
            : data.filter((item) => ((item.Section ?? item.Class ?? item.section ?? item.SectionName)?.toString().trim() === selectedSection));

    // Helper to normalize/format timestamps into M/D/YYYY HH:MM:SS
    const formatTimestamp = (val) => {
        if (val == null || val === "") return "";
        let d = null;
        // If it's already a Date
        if (val instanceof Date) d = val;
        // Excel date serial number (common when reading raw numbers)
        else if (typeof val === "number") {
            // Convert Excel serial to JS timestamp (days since 1899-12-30 -> milliseconds)
            d = new Date(Math.round((val - 25569) * 86400 * 1000));
        } else {
            // Try parsing string
            const parsed = Date.parse(val);
            if (!isNaN(parsed)) d = new Date(parsed);
            else return String(val);
        }

        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${pad(
            d.getHours()
        )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    // Extract full name from file data
    const getFullNameFromData = (row) => {
        // Look for common name field variations in the data
        const firstName = row["First Name"] ?? row["FirstName"] ?? row["first name"] ?? row["firstname"] ?? row["First Name"] ?? "";
        const lastName = row["Last Name"] ?? row["LastName"] ?? row["last name"] ?? row["lastname"] ?? row["Last Name"] ?? "";
        const fullName = row["Full Name"] ?? row["FullName"] ?? row["full name"] ?? row["fullname"] ?? row["Name"] ?? row["name"] ?? "";
        
        // If we have a full name field, use it
        if (fullName && fullName.trim() !== "") {
            return fullName.trim();
        }
        
        // If we have both first and last name, combine them
        if (firstName && lastName && firstName.trim() !== "" && lastName.trim() !== "") {
            return `${firstName.trim()} ${lastName.trim()}`;
        }
        
        // If we only have first name
        if (firstName && firstName.trim() !== "") {
            return `${firstName.trim()} N/A`;
        }
        
        // If we only have last name
        if (lastName && lastName.trim() !== "") {
            return `N/A ${lastName.trim()}`;
        }
        
        // If no name data found
        return "N/A";
    };

    // Only keep requested fields for display/export (Timestamp formatted)
    const projectedData = filteredData.map((row) => ({
        Timestamp: formatTimestamp(row.Timestamp ?? row.timestamp ?? row.Time ?? row.time ?? ""),
        Name: getFullNameFromData(row),
        "Email Address": row["Email Address"] ?? row.Email ?? row.email ?? "",
        Score: row.Score ?? row.score ?? "",
        Section: (row.Section ?? row.Class ?? row.section ?? row.SectionName) ?? "",
    }));

    // Extract surname/last name from full name
    const getSurnameFromName = (fullName) => {
        if (!fullName || typeof fullName !== "string") return "";
        const nameParts = fullName.trim().split(/\s+/);
        // Return the last part as surname
        return nameParts[nameParts.length - 1] || "";
    };

    // Sort projected data by surname/last name (A-Z)
    const projectedDataSorted = projectedData.slice().sort((a, b) => {
        const surnameA = getSurnameFromName(a.Name || "").toLowerCase();
        const surnameB = getSurnameFromName(b.Name || "").toLowerCase();
        if (surnameA < surnameB) return -1;
        if (surnameA > surnameB) return 1;
        // If surnames are the same, sort by full name as tiebreaker
        const nameA = String(a.Name || "").toLowerCase();
        const nameB = String(b.Name || "").toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });





    return (
        <div className="p-4">
            <Header />
            <div className="flex gap-4 items-center mb-4">
                <FileInput onFileChange={handleFileUpload} />
                {data.length > 0 && (
                    <>
                        <SelectSection sections={uniqueSections} value={selectedSection} onChange={setSelectedSection} />
                        <ExportButton onClick={() => exportToExcel(projectedDataSorted)} />
                    </>
                )}
            </div>
            
            {/* Summary Statistics */}
            {data.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Summary Statistics</h2>
                    <div className="flex justify-center">
                        <div className="p-4 bg-white border border-gray-300 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-600">Total Students</h3>
                            <p className="text-3xl font-bold text-blue-800">{projectedDataSorted.length}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <TableDisplay data={projectedDataSorted} />
        </div>
    );
}
