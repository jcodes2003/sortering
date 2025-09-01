"use client";
import React from "react";

export default function ExportButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
            Export to Excel
        </button>
    );
}
