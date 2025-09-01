"use client";
import React from "react";

export default function AbsentTable({ data }) {
    if (!data || data.length === 0) return <div>No absentees found.</div>;

    return (
        <table className="min-w-full border border-gray-300 mt-4">
            <thead>
                <tr>
                    <th className="border px-4 py-2">Surname</th>
                    <th className="border px-4 py-2">Email</th>
                    <th className="border px-4 py-2">Section</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={`absent-${idx}`}>
                        <td className="border px-4 py-2">{row.surname}</td>
                        <td className="border px-4 py-2">{row.email}</td>
                        <td className="border px-4 py-2">{row.section}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
