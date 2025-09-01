"use client";
import React from "react";

const COLUMNS = [
    "Timestamp",
    "Email Address",
    "Score",
    "Section",
];

export default function TableDisplay({ data }) {
    return (
        <table className="min-w-full border border-gray-300">
            <thead>
                <tr>
                    {COLUMNS.map((col, idx) => (
                        <th key={`h-${idx}-${col}`} className="border px-4 py-2">
                            {col}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                        {COLUMNS.map((col, colIndex) => (
                            <td key={`cell-${rowIndex}-${colIndex}-${col}`} className="border px-4 py-2">
                                {((row[col] ?? row[col.replace(/ /g, "")]) === "" || row[col] == null)
                                    ? "Not yet filled by the student"
                                    : (row[col] ?? row[col.replace(/ /g, "")])}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
