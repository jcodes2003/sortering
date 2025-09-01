"use client";
import React from "react";

export default function SelectSection({ sections, value, onChange }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
        >
            {sections.map((sectionName, index) => (
                <option key={`section-${index}-${sectionName}`} value={sectionName}>
                    {sectionName === "all" ? "All Sections" : sectionName}
                </option>
            ))}
        </select>
    );
}
