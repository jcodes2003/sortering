"use client";
import React from "react";

export default function FileInput({ onFileChange }) {
    return (
        <input type="file" accept=".xlsx, .xls" onChange={onFileChange} />
    );
}
