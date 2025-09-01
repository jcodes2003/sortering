"use client";
import React from "react";

export default function AttendanceInput({ onFileChange }) {
    return (
        <div>
            <input type="file" accept=".xlsx, .xls" onChange={onFileChange} />
        </div>
    );
}
