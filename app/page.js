"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
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

    // Attendance roster state
    const [roster, setRoster] = useState([]);
    const [absentees, setAbsentees] = useState([]);

    const handleRosterUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
            // Normalize roster to { surname, email, section }
            const normalized = jsonData.map((r) => ({
                surname: (r.Surname ?? r.surname ?? r.LastName ?? "").toString().trim().toLowerCase(),
                email: (r["Email Address"] ?? r.Email ?? r.email ?? "").toString().trim().toLowerCase(),
                section: (r.Section ?? r.Class ?? r.section ?? r.SectionName ?? "").toString().trim(),
            }));
            setRoster(normalized);
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

    // Only keep requested fields for display/export (Timestamp formatted)
    const projectedData = filteredData.map((row) => ({
        Timestamp: formatTimestamp(row.Timestamp ?? row.timestamp ?? row.Time ?? row.time ?? ""),
        "Email Address": row["Email Address"] ?? row.Email ?? row.email ?? "",
        Score: row.Score ?? row.score ?? "",
        Section: (row.Section ?? row.Class ?? row.section ?? row.SectionName) ?? "",
    }));

    // Extract surname from email local-part. Example: albe.cabasa.coc@... -> surname = 'cabasa'
    const getSurnameFromEmail = (email) => {
        if (!email || typeof email !== "string") return "";
        const local = email.split("@")[0] || "";
        const parts = local.split(".").map((p) => p.trim()).filter(Boolean);
        // Prefer the second token (index 1) as surname if present, otherwise use last token
        if (parts.length >= 2) return parts[1];
        if (parts.length === 1) return parts[0];
        return "";
    };

    // Sort projected data by surname (A-Z), fallback to full email
    const projectedDataSorted = projectedData.slice().sort((a, b) => {
        const sa = String(getSurnameFromEmail(a["Email Address"]) || "").toLowerCase();
        const sb = String(getSurnameFromEmail(b["Email Address"]) || "").toLowerCase();
        if (sa < sb) return -1;
        if (sa > sb) return 1;
        // tiebreak by full email address
        const ea = String(a["Email Address"] || "").toLowerCase();
        const eb = String(b["Email Address"] || "").toLowerCase();
        if (ea < eb) return -1;
        if (ea > eb) return 1;
        return 0;
    });

    // Compute absentees by comparing roster surnames to submitted surnames within selected section
    const computeAbsentees = () => {
        if (!roster || roster.length === 0) return setAbsentees([]);
        // Build set of surnames from projectedDataSorted for the selected section
        const submittedSurnames = new Set(
            projectedDataSorted.map((r) => getSurnameFromEmail(r["Email Address"]).toLowerCase()).filter(Boolean)
        );

        const abs = roster
            .filter((r) => (selectedSection === "all" ? true : r.section === selectedSection))
            .filter((r) => !submittedSurnames.has(r.surname))
            .map((r) => ({ surname: r.surname, email: r.email, section: r.section }));

        setAbsentees(abs);
    };

    const exportAbsentees = () => {
        const ws = XLSX.utils.json_to_sheet(absentees.map(a => ({ Surname: a.surname, Email: a.email, Section: a.section })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Absentees");
        XLSX.writeFile(wb, `${selectedSection}_absentees.xlsx`);
    };

    return (
        <div className="p-4">
            <div className="flex gap-4 items-center mb-4">
                <FileInput onFileChange={handleFileUpload} />
                {data.length > 0 && (
                    <>
                        <SelectSection sections={uniqueSections} value={selectedSection} onChange={setSelectedSection} />
                        <ExportButton onClick={() => exportToExcel(projectedDataSorted)} />
                    </>
                )}
            </div>
            <TableDisplay data={projectedDataSorted} />
        </div>
    );
}
